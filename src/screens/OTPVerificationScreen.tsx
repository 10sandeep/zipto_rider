import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  verifyOTP,
  sendRegisterOTP,
  sendLoginOTP,
  getApiErrorMessage,
} from '../services/authService';
import {useAuthStore} from '../store/authStore';
import {OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS} from '../config/api.config';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

export default function OTPVerificationScreen({navigation, route}: any) {
  const {phoneNumber, flow} = route.params as {
    phoneNumber: string;
    flow: 'register' | 'login';
  };

  const initialOtp = Array(OTP_LENGTH).fill('');
  const [otp, setOtp] = useState<string[]>(initialOtp);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(
    OTP_RESEND_COOLDOWN_SECONDS,
  );
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setAuth = useAuthStore(state => state.setAuth);
  const setOnboardingSubmitted = useAuthStore(
    state => state.setOnboardingSubmitted,
  );

  const resolvePostOtpRoute = useCallback(
    async (currentFlow: 'register' | 'login') => {
      const {
        getVerificationStatus,
        getDriverProfile,
        getMyVehicles,
      } = require('../services/driverService');

      const statusData = await getVerificationStatus();

      if (statusData.verification_status === 'APPROVED') {
        navigation.replace('MainTabs');
        return;
      }

      // Registration flow always starts onboarding from first step.
      if (currentFlow === 'register') {
        setOnboardingSubmitted(false);
        navigation.replace('KYCVehicleRegistration');
        return;
      }

      // For login flow with non-approved status, decide based on onboarding completeness.
      let hasRequiredProfileData = false;
      let hasVehicle = false;

      try {
        const profile = await getDriverProfile();
        hasRequiredProfileData = Boolean(
          profile?.name?.trim() &&
            profile?.email?.trim() &&
            profile?.address?.trim(),
        );
      } catch {
        // profile fetch failed — continue with defaults
      }

      try {
        const vehicles = await getMyVehicles();
        hasVehicle = Array.isArray(vehicles) && vehicles.length > 0;
      } catch {
        // vehicle fetch failed — continue with defaults
      }

      navigation.replace(
        hasRequiredProfileData && hasVehicle
          ? 'KYCStatus'
          : 'KYCVehicleRegistration',
      );
    },
    [navigation, setOnboardingSubmitted],
  );

  // ─── Resend countdown timer ──────────────────────────────────────────────────
  const startResendTimer = useCallback(() => {
    setCanResend(false);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startResendTimer]);

  // ─── OTP input handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyOTP(phoneNumber, otpCode, 'driver');

      // Build a safe user — API returns user with snake_case fields
      const safeUser = response.user ?? {
        id: '',
        phone: phoneNumber,
        role: 'driver',
      };

      // Persist token and user in store (API uses access_token / refresh_token)
      setAuth(response.access_token, safeUser, response.refresh_token);

      try {
        await resolvePostOtpRoute(flow);
      } catch {
        // Safe fallback: start onboarding when route resolution fails.
        navigation.replace('KYCVehicleRegistration');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Verification Failed', message, [{text: 'Try Again'}]);
      // Clear OTP inputs so user can retry
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    try {
      if (flow === 'register') {
        await sendRegisterOTP(phoneNumber);
      } else {
        await sendLoginOTP(phoneNumber);
      }

      // Reset inputs and restart timer
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      startResendTimer();

      Alert.alert('OTP Sent', `A new OTP has been sent to ${phoneNumber}.`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Resend Failed', message, [{text: 'OK'}]);
    } finally {
      setIsResending(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons
              name="arrow-back"
              size={moderateScale(24)}
              color="#3B82F6"
            />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={moderateScale(isSmallDevice ? 45 : 50)}
              color="#3B82F6"
            />
          </View>
          <Text style={styles.titleText}>Enter OTP</Text>
          <Text style={styles.subtitleText}>
            We've sent a {OTP_LENGTH}-digit code to
          </Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>
        </View>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                isVerifying ? styles.otpInputDisabled : null,
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                activeOpacity={0.7}>
                {isResending ? (
                  <ActivityIndicator
                    color="#3B82F6"
                    size="small"
                    style={styles.resendLoader}
                  />
                ) : (
                  <Text style={styles.resendButton}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.resendCooldownText}>
              Resend OTP in{' '}
              <Text style={styles.resendCooldownTimer}>{resendCooldown}s</Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!isOtpComplete || isVerifying) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerifyOTP}
          disabled={!isOtpComplete || isVerifying}
          activeOpacity={0.8}>
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Change Number */}
        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.changeNumberText}>Change phone number</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(30),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(30),
  },
  backButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: verticalScale(30),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(50),
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleText: {
    fontSize: moderateScale(isSmallDevice ? 28 : 32),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  phoneText: {
    fontSize: moderateScale(16),
    color: '#1C1C1E',
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(16),
    marginBottom: verticalScale(30),
  },
  otpInput: {
    width: scale(isSmallDevice ? 60 : 68),
    height: verticalScale(72),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(14),
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  otpInputFilled: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
    gap: scale(4),
    flexWrap: 'wrap',
    minHeight: verticalScale(22),
  },
  resendText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
  },
  resendButton: {
    fontSize: moderateScale(14),
    color: '#3B82F6',
    fontWeight: '700',
  },
  resendLoader: {
    marginLeft: scale(4),
  },
  resendCooldownText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
  },
  resendCooldownTimer: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(54),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: verticalScale(16),
  },
  verifyButtonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  changeNumberText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    fontWeight: '500',
  },
});
