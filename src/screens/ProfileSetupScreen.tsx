import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useOnboardingStore} from '../store/onboardingStore';
import {useAuthStore} from '../store/authStore';
import {
  submitOnboarding,
  getOnboardingErrorMessage,
} from '../services/onboardingService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 414;

// ─── Color System ────────────────────────────────────────────
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  background: '#F8F9FF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  disabled: '#BFDBFE',
  indigo: '#3730A3',
  success: '#16A34A',
};

export default function ProfileSetupScreen({navigation}: any) {
  const store = useOnboardingStore();
  const setOnboardingSubmitted = useAuthStore(
    state => state.setOnboardingSubmitted,
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    address.trim().length > 0;

  const handleComplete = async () => {
    if (!isFormValid || isSubmitting) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    store.setProfile({
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
    });

    const latestState = useOnboardingStore.getState();
    const payload = {
      vehicleType: latestState.vehicleType,
      vehicleModel: latestState.vehicleModel,
      vehicleCapacity: latestState.vehicleCapacity,
      vehicleRegistrationNumber: latestState.vehicleRegistrationNumber,
      documents: latestState.documents,
      licenseNumber: latestState.licenseNumber,
      licenseExpiry: latestState.licenseExpiry,
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    setIsSubmitting(true);

    try {
      console.log('[ProfileSetup] Submitting onboarding…');
      await submitOnboarding(payload);
      console.log('[ProfileSetup] Onboarding success!');
      setOnboardingSubmitted(true);
      navigation.navigate('KYCStatus');
    } catch (error) {
      console.log('[ProfileSetup] Onboarding error:', error);
      const message = getOnboardingErrorMessage(error);
      Alert.alert('Submission Failed', message, [{text: 'Try Again'}]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const docsCount = Object.values(store.documents).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(20)}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Step 3 of 4</Text>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: '75%'}]} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Title Block */}
          <View style={styles.titleBlock}>
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>Final Step</Text>
            </View>
            <Text style={styles.title}>Complete Your{'\n'}Profile</Text>
            <Text style={styles.subtitle}>
              Fill in your personal details to finish setup
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsDot} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused,
                ]}>
                <Ionicons
                  name="person-outline"
                  size={moderateScale(18)}
                  color={focusedField === 'name' ? COLORS.primary : '#9CA3AF'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#C4C9D4"
                  value={name}
                  onChangeText={setName}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}>
                <Ionicons
                  name="mail-outline"
                  size={moderateScale(18)}
                  color={focusedField === 'email' ? COLORS.primary : '#9CA3AF'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#C4C9D4"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Address */}
            <View style={[styles.inputContainer, {marginBottom: 0}]}>
              <Text style={styles.label}>Current Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  styles.inputWrapperTextArea,
                  focusedField === 'address' && styles.inputWrapperFocused,
                ]}>
                <Ionicons
                  name="location-outline"
                  size={moderateScale(18)}
                  color={
                    focusedField === 'address' ? COLORS.primary : '#9CA3AF'
                  }
                  style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: verticalScale(14)}]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your complete address"
                  placeholderTextColor="#C4C9D4"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
              <Ionicons
                name="car-sport-outline"
                size={moderateScale(20)}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                {store.vehicleModel || '—'}
              </Text>
              <Text style={styles.summarySubtext}>
                {store.vehicleRegistrationNumber || '—'}
                {'  ·  '}
                <Text style={{color: docsCount === 5 ? COLORS.success : COLORS.textSecondary}}>
                  {docsCount}/5 documents
                </Text>
              </Text>
            </View>
            <View style={styles.summaryBadge}>
              <Ionicons
                name="checkmark-circle"
                size={moderateScale(16)}
                color={docsCount === 5 ? COLORS.success : '#D1D5DB'}
              />
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={moderateScale(18)}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.infoText}>
              Your information is encrypted and stored securely
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isFormValid || isSubmitting) && styles.continueButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.85}>
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.continueButtonText, {marginLeft: scale(10)}]}>
                Submitting…
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.continueButtonText}>Complete Setup</Text>
              <View
                style={[
                  styles.buttonArrow,
                  (!isFormValid || isSubmitting) && styles.buttonArrowDisabled,
                ]}>
                <Ionicons
                  name="checkmark"
                  size={moderateScale(18)}
                  color={isFormValid && !isSubmitting ? COLORS.primary : COLORS.disabled}
                />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ─── Header ──────────────────────────────────────────────────
  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(54) : verticalScale(40),
    paddingBottom: verticalScale(16),
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
  },
  backButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(13),
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  progressSection: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  progressLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.3,
  },
  progressPercent: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  progressTrack: {
    height: verticalScale(5),
    backgroundColor: '#E0E7FF',
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(10),
  },

  // ─── Scroll ───────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(130),
  },

  // ─── Title Block ──────────────────────────────────────────────
  titleBlock: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(24),
  },
  titleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  titleBadgeText: {
    fontSize: moderateScale(11),
    color: '#4F46E5',
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 26 : isLargeDevice ? 32 : 28),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    lineHeight: moderateScale(isSmallDevice ? 33 : isLargeDevice ? 40 : 36),
    letterSpacing: -0.5,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    lineHeight: moderateScale(20),
  },

  // ─── Form Card ────────────────────────────────────────────────
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(20),
    padding: scale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(18),
    gap: scale(8),
  },
  detailsDot: {
    width: moderateScale(6),
    height: moderateScale(22),
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(3),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: verticalScale(14),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginBottom: verticalScale(7),
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(13),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: scale(14),
    minHeight: verticalScale(52),
  },
  inputWrapperTextArea: {
    alignItems: 'flex-start',
    minHeight: verticalScale(90),
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    paddingVertical: verticalScale(12),
    fontWeight: '500',
  },
  textArea: {
    height: verticalScale(80),
    paddingTop: verticalScale(14),
  },

  // ─── Summary Card ─────────────────────────────────────────────
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: scale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: verticalScale(14),
    gap: scale(12),
  },
  summaryIconWrap: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(2),
  },
  summarySubtext: {
    fontSize: moderateScale(12),
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  summaryBadge: {
    flexShrink: 0,
  },

  // ─── Info Box ─────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: scale(16),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: scale(12),
  },
  infoIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontFamily: 'Poppins-Regular',
    color: COLORS.indigo,
    lineHeight: moderateScale(19),
    fontWeight: '500',
  },

  // ─── Footer ───────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(14),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(36) : verticalScale(22),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(56),
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.3,
    marginRight: scale(8),
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrow: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(10),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonArrowDisabled: {
    backgroundColor: '#EFF6FF',
  },
});