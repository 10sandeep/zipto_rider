import React, {useState} from 'react';
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
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {sendLoginOTP, getApiErrorMessage} from '../services/authService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ── Brand palette ──────────────────────────────────────────────────────────────
const BRAND       = '#1E22AD';
const BRAND_LIGHT = '#E8E9F8';
const BRAND_MID   = '#4347C4';

export default function LoginScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  // ── ALL LOGIC UNCHANGED ────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const trimmedPhone = phoneNumber.trim();
    if (trimmedPhone.length !== 10) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit mobile number.',
      );
      return;
    }
    const fullPhone = countryCode + trimmedPhone;
    setIsLoading(true);
    try {
      await sendLoginOTP(fullPhone);
      navigation.navigate('OTPVerification', {
        phoneNumber: fullPhone,
        flow: 'login',
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Failed to Send OTP', message, [{text: 'OK'}]);
    } finally {
      setIsLoading(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  const isValid = phoneNumber.length === 10;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />

      {/* ── Top brand hero panel ─────────────────────────────────────────── */}
      <View style={styles.heroPanel}>
        {/* Decorative depth circles */}
        <View style={styles.decCircleLarge} />
        <View style={styles.decCircleSmall} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={moderateScale(20)} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Hero text */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome Back!</Text>
          <Text style={styles.heroSubtitle}>
            Sign in to your Zipto Rider account{'\n'}and start delivering.
          </Text>
        </View>
      </View>

      {/* ── White form card ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.formCard}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}>

        {/* Step pill */}
        <View style={styles.stepPill}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>Phone Verification</Text>
        </View>

        {/* Label */}
        <Text style={styles.label}>Mobile Number</Text>

        {/* Phone input row */}
        <View style={styles.phoneRow}>
          <View style={styles.countryPill}>
            <Text style={styles.flagEmoji}>🇮🇳</Text>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <View style={styles.pillDivider} />
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="00000 00000"
            placeholderTextColor="#BCBCCC"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus
            editable={!isLoading}
          />
        </View>

        {/* Helper */}
        <Text style={styles.helperText}>
          We'll send a 6-digit OTP to verify your number.
        </Text>
      </ScrollView>

      {/* ── Sticky bottom — always visible above keyboard ────────────────── */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.otpButton,
            (!isValid || isLoading) && styles.otpButtonDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={!isValid || isLoading}
          activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.otpButtonInner}>
              <Text style={styles.otpButtonText}>Send OTP</Text>
              <Ionicons
                name="arrow-forward"
                size={moderateScale(18)}
                color="#FFFFFF"
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>secure & private</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text>
          {'  '}and{'  '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_RADIUS = moderateScale(32);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND,
  },

  // ── Hero panel ──────────────────────────────────────────────────────────────
  heroPanel: {
    backgroundColor: BRAND,
    paddingTop:
      Platform.OS === 'ios' ? verticalScale(58) : verticalScale(44),
    paddingHorizontal: scale(28),
    paddingBottom: verticalScale(36),
    overflow: 'hidden',
  },

  decCircleLarge: {
    position: 'absolute',
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: BRAND_MID,
    opacity: 0.35,
    top: -scale(60),
    right: -scale(50),
  },
  decCircleSmall: {
    position: 'absolute',
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: BRAND_MID,
    opacity: 0.2,
    bottom: verticalScale(10),
    left: -scale(30),
  },

  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },

  heroContent: {
    alignItems: 'flex-start',
  },

  heroTitle: {
    fontSize: moderateScale(isSmallDevice ? 26 : 30),
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Cocon-Regular',
    letterSpacing: 0.4,
    marginBottom: verticalScale(8),
  },

  heroSubtitle: {
    fontSize: moderateScale(13.5),
    color: 'rgba(255,255,255,0.70)',
    lineHeight: moderateScale(20),
    fontFamily: 'Poppins-Regular',
  },

  // ── Form card ───────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },

  formContent: {
    flexGrow: 1,
    paddingHorizontal: scale(28),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(16),
  },

  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: BRAND_LIGHT,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    marginBottom: verticalScale(28),
    gap: scale(6),
  },
  stepDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: BRAND,
  },
  stepText: {
    fontSize: moderateScale(11.5),
    color: BRAND,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.2,
  },

  label: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#1C1C2E',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: verticalScale(10),
    letterSpacing: 0.3,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E4E4EF',
    borderRadius: moderateScale(14),
    backgroundColor: '#FAFAFE',
    overflow: 'hidden',
    marginBottom: verticalScale(10),
  },

  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(16),
    gap: scale(6),
    backgroundColor: '#F1F1FA',
  },
  flagEmoji: {
    fontSize: moderateScale(20),
  },
  countryCode: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#1C1C2E',
    fontFamily: 'Poppins-Bold',
  },
  pillDivider: {
    width: 1,
    height: moderateScale(22),
    backgroundColor: '#D8D8E8',
    marginLeft: scale(8),
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: '#1C1C2E',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1.5,
  },

  helperText: {
    fontSize: moderateScale(12),
    color: '#9898B0',
    fontFamily: 'Poppins-Regular',
    marginBottom: verticalScale(8),
    letterSpacing: 0.1,
  },

  // ── Sticky bottom ───────────────────────────────────────────────────────────
  bottomSection: {
    paddingHorizontal: scale(28),
    paddingTop: verticalScale(16),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(36) : verticalScale(24),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: verticalScale(12),
  },

  otpButton: {
    backgroundColor: BRAND,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(17),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  otpButtonDisabled: {
    backgroundColor: '#A8AADC',
    shadowOpacity: 0,
    elevation: 0,
  },
  otpButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  otpButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBF5',
  },
  dividerLabel: {
    fontSize: moderateScale(11),
    color: '#BCBCCC',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  termsText: {
    fontSize: moderateScale(12.5),
    color: '#9898B0',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: scale(10),
  },
  linkText: {
    color: BRAND,
    fontFamily: 'Poppins-SemiBold',
  },
});