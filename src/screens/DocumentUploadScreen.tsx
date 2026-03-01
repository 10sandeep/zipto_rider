import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useOnboardingStore, DocumentFiles} from '../store/onboardingStore';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Color System ────────────────────────────────────────────
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  success: '#16A34A',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  disabled: '#93C5FD',
};

// ─── Document definitions (mapped to API field names) ────────
interface DocItem {
  id: keyof DocumentFiles;
  name: string;
  description: string;
  useCamera: boolean;
  icon: string;
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'aadhar_front',
    name: 'Aadhar Card (Front)',
    description: 'Upload front side of your Aadhar',
    useCamera: false,
    icon: 'card-outline',
  },
  {
    id: 'aadhar_back',
    name: 'Aadhar Card (Back)',
    description: 'Upload back side of your Aadhar',
    useCamera: false,
    icon: 'card-outline',
  },
  {
    id: 'driving_license',
    name: 'Driving License',
    description: 'Upload your driving license',
    useCamera: false,
    icon: 'document-outline',
  },
  {
    id: 'vehicle_rc',
    name: 'Vehicle RC',
    description: 'Upload vehicle registration certificate',
    useCamera: false,
    icon: 'car-outline',
  },
  {
    id: 'profile_photo',
    name: 'Profile Photo (Selfie)',
    description: 'Take a clear selfie',
    useCamera: true,
    icon: 'camera-outline',
  },
];

// ─── Camera Permission ───────────────────────────────────────
const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'Camera access is required to take your selfie',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// ─── Component ───────────────────────────────────────────────
export default function DocumentUploadScreen({navigation}: any) {
  const setDocumentsStore = useOnboardingStore(s => s.setDocuments);

  const [fileUris, setFileUris] = useState<DocumentFiles>({
    aadhar_front: null,
    aadhar_back: null,
    driving_license: null,
    vehicle_rc: null,
    profile_photo: null,
  });

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // Handle picking / capturing a document
  const handleDocumentClick = useCallback(async (doc: DocItem) => {
    try {
      if (doc.useCamera) {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return;
        }

        const result = await launchCamera({
          mediaType: 'photo',
          cameraType: 'front',
          quality: 0.8,
          saveToPhotos: false,
        });

        if (result.didCancel) return;
        if (result.assets?.[0]?.uri) {
          setFileUris(prev => ({...prev, [doc.id]: result.assets![0].uri!}));
        }
      } else {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (result.didCancel) return;
        if (result.assets?.[0]?.uri) {
          setFileUris(prev => ({...prev, [doc.id]: result.assets![0].uri!}));
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to open camera or gallery.');
    }
  }, []);

  const uploadedCount = Object.values(fileUris).filter(Boolean).length;
  const allDocsUploaded = uploadedCount === DOCUMENTS.length;

  const isFormValid =
    allDocsUploaded &&
    licenseNumber.trim().length > 0 &&
    licenseExpiry.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(
        'Incomplete',
        'Please upload all documents and fill in license details.',
      );
      return;
    }

    setDocumentsStore({
      documents: fileUris,
      licenseNumber: licenseNumber.trim(),
      licenseExpiry: licenseExpiry.trim(),
    });

    navigation.navigate('ProfileSetup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>
          Progress: {uploadedCount} of {DOCUMENTS.length} completed
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Document Cards */}
          {DOCUMENTS.map(doc => {
            const isUploaded = !!fileUris[doc.id];
            return (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.85}
                style={[
                  styles.documentCard,
                  isUploaded && styles.documentCardUploaded,
                ]}
                onPress={() => handleDocumentClick(doc)}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentStatus}>
                    {isUploaded ? 'Uploaded successfully' : doc.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.uploadIcon,
                    isUploaded && styles.uploadIconSuccess,
                  ]}>
                  {isUploaded ? (
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(24)}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name={doc.icon as any}
                      size={moderateScale(24)}
                      color={COLORS.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* License Details */}
          <View style={styles.licenseSection}>
            <Text style={styles.sectionTitle}>License Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. OD02-20220001234"
                placeholderTextColor="#999"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Expiry Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g. 2030-12-31)"
                placeholderTextColor="#999"
                value={licenseExpiry}
                onChangeText={setLicenseExpiry}
                keyboardType="default"
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={moderateScale(20)}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Make sure photos are clear and details are readable
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleContinue}
          activeOpacity={0.8}
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled,
          ]}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? verticalScale(56) : verticalScale(46),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(14),
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 24 : 28),
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    marginTop: verticalScale(4),
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: verticalScale(140),
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: scale(18),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    minHeight: verticalScale(80),
  },
  documentCardUploaded: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  documentInfo: {
    flex: 1,
    paddingRight: scale(12),
  },
  documentName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(6),
  },
  documentStatus: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
  },
  uploadIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconSuccess: {
    backgroundColor: COLORS.success,
  },
  // ─── License Section ──────────────────────────────────
  licenseSection: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(16),
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    fontSize: moderateScale(16),
    color: COLORS.textPrimary,
    minHeight: verticalScale(50),
  },
  // ─── Info + Footer ────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: scale(16),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(10),
  },
  infoIcon: {
    marginRight: scale(10),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(18),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(36) : verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(54),
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '700',
  },
});
