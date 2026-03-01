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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {sendRegisterOTP, getApiErrorMessage} from '../services/authService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

export default function RegisterScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

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
      await sendRegisterOTP(fullPhone);

      // On success, navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: fullPhone,
        flow: 'register',
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Failed to Send OTP', message, [{text: 'OK'}]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#3B82F6"
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="truck-fast"
              size={moderateScale(isSmallDevice ? 45 : 50)}
              color="#3B82F6"
            />
          </View>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>
            Enter your phone number to get started
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (phoneNumber.length !== 10 || isLoading) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={phoneNumber.length !== 10 || isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
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
  logoCircle: {
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
  welcomeText: {
    fontSize: moderateScale(isSmallDevice ? 28 : 32),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: moderateScale(22),
    paddingHorizontal: scale(20),
  },
  inputSection: {
    marginBottom: verticalScale(30),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(12),
    marginRight: scale(12),
    gap: scale(8),
    minHeight: verticalScale(54),
  },
  flagEmoji: {
    fontSize: moderateScale(24),
  },
  countryCodeText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(12),
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1C1C1E',
    minHeight: verticalScale(54),
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
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
  termsText: {
    fontSize: moderateScale(13),
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    paddingHorizontal: scale(10),
  },
  linkText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
