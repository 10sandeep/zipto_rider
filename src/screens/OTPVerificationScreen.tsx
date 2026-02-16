import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function OTPVerificationScreen({ navigation, route }: any) {
  const { phoneNumber, flow } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Verify OTP API call here
      // const response = await verifyOTP(phoneNumber, otpCode);
      
      if (flow === 'register') {
        // For registration, go to KYC flow
        navigation.navigate('KYCVehicleRegistration');
      } else {
        // For login, go directly to main tabs (home)
        navigation.navigate('MainTabs');
      }
    }
  };

  const handleResendOTP = () => {
    // Resend OTP API call here
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button - Only show if can go back */}
        {navigation.canGoBack() && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
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
            We've sent a 6-digit code to
          </Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity 
            onPress={handleResendOTP}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            activeOpacity={0.7}
          >
            <Text style={styles.resendButton}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            !isOtpComplete && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerifyOTP}
          disabled={!isOtpComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
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
  backButtonText: {
    fontSize: moderateScale(16),
    color: '#3B82F6',
    fontWeight: '600',
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
  iconEmoji: {
    fontSize: moderateScale(50),
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
    justifyContent: 'space-between',
    marginBottom: verticalScale(30),
    paddingHorizontal: scale(isSmallDevice ? 0 : 5),
  },
  otpInput: {
    width: scale(isSmallDevice ? 46 : 50),
    height: verticalScale(56),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
    fontSize: moderateScale(24),
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
    gap: scale(4),
    flexWrap: 'wrap',
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
});