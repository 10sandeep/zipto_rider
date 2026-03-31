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

const OTP_BOX_SIZE = Math.floor(
  (SCREEN_WIDTH - scale(64) - (OTP_LENGTH - 1) * scale(12)) / OTP_LENGTH,
);

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1A56DB',
  primaryLight: '#EBF2FF',
  primaryMid: '#BFDBFE',
  accent: '#0EA5E9',
  dark: '#0F172A',
  medium: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
  surface: '#F8FAFC',
  white: '#FFFFFF',
  success: '#10B981',
  danger: '#EF4444',
};

export default function OTPVerificationScreen({navigation, route}: any) {
  const {phoneNumber, flow} = route.params as {
    phoneNumber: string;
    flow: 'register' | 'login';
  };

  const initialOtp = Array(OTP_LENGTH).fill('');
  const [otp, setOtp] = useState<string[]>(initialOtp);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setAuth = useAuthStore(state => state.setAuth);
  const setOnboardingSubmitted = useAuthStore(state => state.setOnboardingSubmitted);

  const resolvePostOtpRoute = useCallback(
    async (currentFlow: 'register' | 'login') => {
      const {getVerificationStatus, getDriverProfile, getMyVehicles} =
        require('../services/driverService');

      const statusData = await getVerificationStatus();

      if (statusData.verification_status === 'APPROVED') {
        navigation.replace('MainTabs');
        return;
      }

      if (currentFlow === 'register') {
        setOnboardingSubmitted(false);
        navigation.replace('KYCVehicleRegistration');
        return;
      }

      let hasRequiredProfileData = false;
      let hasVehicle = false;

      try {
        const profile = await getDriverProfile();
        hasRequiredProfileData = Boolean(
          profile?.name?.trim() &&
            profile?.email?.trim() &&
            profile?.address?.trim(),
        );
      } catch {}

      try {
        const vehicles = await getMyVehicles();
        hasVehicle = Array.isArray(vehicles) && vehicles.length > 0;
      } catch {}

      navigation.replace(
        hasRequiredProfileData && hasVehicle
          ? 'KYCStatus'
          : 'KYCVehicleRegistration',
      );
    },
    [navigation, setOnboardingSubmitted],
  );

  // ─── Resend countdown timer ──────────────────────────────────────────────
  const startResendTimer = useCallback(() => {
    setCanResend(false);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startResendTimer]);

  // ─── OTP input handlers ──────────────────────────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const filledCount = otp.filter(d => d !== '').length;

  // ─── Verify OTP ──────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) return;

    setIsVerifying(true);
    try {
      const response = await verifyOTP(phoneNumber, otpCode, 'driver');
      const safeUser = response.user ?? {id: '', phone: phoneNumber, role: 'driver'};
      setAuth(response.access_token, safeUser, response.refresh_token);
      try {
        await resolvePostOtpRoute(flow);
      } catch {
        navigation.replace('KYCVehicleRegistration');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Verification Failed', message, [{text: 'Try Again'}]);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      if (flow === 'register') await sendRegisterOTP(phoneNumber);
      else await sendLoginOTP(phoneNumber);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      startResendTimer();
      Alert.alert('OTP Sent', `A new code has been sent to ${phoneNumber}.`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Resend Failed', message, [{text: 'OK'}]);
    } finally {
      setIsResending(false);
    }
  };

  // ─── Progress dots ───────────────────────────────────────────────────────
  const renderProgressDots = () => (
    <View style={styles.progressRow}>
      {Array(OTP_LENGTH)
        .fill(0)
        .map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < filledCount
                ? styles.progressDotFilled
                : styles.progressDotEmpty,
            ]}
          />
        ))}
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

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
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Ionicons name="arrow-back" size={moderateScale(20)} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          {/* Icon badge */}
          <View style={styles.iconBadge}>
            <View style={styles.iconRing}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={moderateScale(isSmallDevice ? 32 : 36)}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* Label pill */}
          <View style={styles.labelPill}>
            <View style={styles.labelDot} />
            <Text style={styles.labelText}>
              {flow === 'register' ? 'Account Verification' : 'Login Verification'}
            </Text>
          </View>

          <Text style={styles.titleText}>Verify your{'\n'}phone number</Text>
          <Text style={styles.subtitleText}>
            Enter the {OTP_LENGTH}-digit code sent to
          </Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* OTP Input Boxes */}
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Enter verification code</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused,
                  digit ? styles.otpInputFilled : styles.otpInputEmpty,
                  isVerifying && styles.otpInputDisabled,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifying}
              />
            ))}
          </View>

          {/* Progress indicator */}
          {renderProgressDots()}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendCard}>
          {canResend ? (
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                activeOpacity={0.7}>
                {isResending ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <Text style={styles.resendButton}>Resend code</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resendRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={moderateScale(14)}
                color={COLORS.muted}
                style={{marginRight: scale(5)}}
              />
              <Text style={styles.resendCooldownText}>
                Resend available in{' '}
                <Text style={styles.resendCooldownTimer}>{resendCooldown}s</Text>
              </Text>
            </View>
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
          activeOpacity={0.85}>
          {isVerifying ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <View style={styles.verifyButtonInner}>
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              <Ionicons
                name="arrow-forward"
                size={moderateScale(18)}
                color={COLORS.white}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Change Number */}
        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Ionicons
            name="pencil-outline"
            size={moderateScale(13)}
            color={COLORS.muted}
            style={{marginRight: scale(4)}}
          />
          <Text style={styles.changeNumberText}>Change phone number</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(28),
    paddingTop: Platform.OS === 'ios' ? verticalScale(56) : verticalScale(44),
    paddingBottom: verticalScale(36),
  },

  // ── Back Button ───────────────────────────────────────────────────────────
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: verticalScale(28),
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  iconBadge: {
    marginBottom: verticalScale(20),
  },
  iconRing: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primaryMid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    marginBottom: verticalScale(14),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
  },
  labelDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: COLORS.primary,
    marginRight: scale(6),
  },
  labelText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: moderateScale(isSmallDevice ? 26 : 30),
    fontWeight: '800',
    color: COLORS.dark,
    lineHeight: moderateScale(isSmallDevice ? 34 : 38),
    letterSpacing: -0.5,
    marginBottom: verticalScale(10),
  },
  subtitleText: {
    fontSize: moderateScale(14),
    color: COLORS.medium,
    fontWeight: '400',
    marginBottom: verticalScale(3),
  },
  phoneText: {
    fontSize: moderateScale(15),
    color: COLORS.dark,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(28),
  },

  // ── OTP Section ───────────────────────────────────────────────────────────
  otpSection: {
    marginBottom: verticalScale(20),
  },
  otpLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: verticalScale(14),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  otpInput: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE,
    borderRadius: moderateScale(14),
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  otpInputEmpty: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
  },
  otpInputDisabled: {
    opacity: 0.45,
  },

  // ── Progress dots ─────────────────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    gap: scale(6),
    alignItems: 'center',
  },
  progressDot: {
    height: moderateScale(4),
    borderRadius: moderateScale(2),
  },
  progressDotFilled: {
    width: moderateScale(20),
    backgroundColor: COLORS.primary,
  },
  progressDotEmpty: {
    width: moderateScale(8),
    backgroundColor: COLORS.border,
  },

  // ── Resend Card ───────────────────────────────────────────────────────────
  resendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: verticalScale(28),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: moderateScale(13),
    color: COLORS.medium,
    fontWeight: '400',
  },
  resendButton: {
    fontSize: moderateScale(13),
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.primary,
  },
  resendCooldownText: {
    fontSize: moderateScale(13),
    color: COLORS.muted,
    fontWeight: '400',
  },
  resendCooldownTimer: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── Verify Button ─────────────────────────────────────────────────────────
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(52),
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: verticalScale(16),
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.primaryMid,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Change Number ─────────────────────────────────────────────────────────
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
  },
  changeNumberText: {
    fontSize: moderateScale(13),
    color: COLORS.muted,
    fontWeight: '500',
  },
});