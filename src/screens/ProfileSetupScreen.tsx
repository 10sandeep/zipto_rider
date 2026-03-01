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

export default function ProfileSetupScreen({navigation}: any) {
  const store = useOnboardingStore();
  const setOnboardingSubmitted = useAuthStore(
    state => state.setOnboardingSubmitted,
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    address.trim().length > 0;

  const handleComplete = async () => {
    if (!isFormValid || isSubmitting) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Save profile to store
    store.setProfile({
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
    });

    // Build the full payload from the store (read latest state)
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

      // Navigate to status screen
      navigation.navigate('KYCStatus');
    } catch (error) {
      console.log('[ProfileSetup] Onboarding error:', error);
      const message = getOnboardingErrorMessage(error);
      Alert.alert('Submission Failed', message, [{text: 'Try Again'}]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
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
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: '75%'}]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.titleSection}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Final step — fill in your personal details
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Current Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your complete address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Summary card */}
          <View style={styles.summaryCard}>
            <Ionicons
              name="car-sport-outline"
              size={moderateScale(22)}
              color="#3B82F6"
              style={{marginRight: scale(10)}}
            />
            <View style={{flex: 1}}>
              <Text style={styles.summaryLabel}>
                Vehicle: {store.vehicleModel || '—'}
              </Text>
              <Text style={styles.summarySubtext}>
                {store.vehicleRegistrationNumber || '—'} ·{' '}
                {Object.values(store.documents).filter(Boolean).length}/5
                documents
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isFormValid || isSubmitting) && styles.continueButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}>
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.continueButtonText, {marginLeft: 10}]}>
                Submitting…
              </Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    height: verticalScale(4),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(2),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(2),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(120),
  },
  titleSection: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 24 : 28),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#8E8E93',
    fontWeight: '500',
    lineHeight: moderateScale(22),
  },
  form: {
    gap: verticalScale(4),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    fontSize: moderateScale(16),
    color: '#1C1C1E',
    minHeight: verticalScale(50),
  },
  textArea: {
    height: verticalScale(80),
    textAlignVertical: 'top',
    paddingTop: verticalScale(14),
  },
  // ─── Summary Card ─────────────────────────────────────
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: scale(16),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(10),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1C1C1E',
  },
  summarySubtext: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    marginTop: 2,
  },
  // ─── Footer ───────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(40) : verticalScale(30),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
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
  continueButtonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
