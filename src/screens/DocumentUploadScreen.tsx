import React, {useState, useCallback, useRef} from 'react';
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
  Animated,
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
const isLargeDevice = SCREEN_WIDTH >= 414;

// ─── Color System ────────────────────────────────────────────
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  success: '#16A34A',
  successLight: '#F0FDF4',
  successBorder: '#BBF7D0',
  background: '#F8F9FF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  disabled: '#BFDBFE',
  indigo: '#3730A3',
};

// ─── Document definitions (mapped to API field names) ────────
interface DocItem {
  id: keyof DocumentFiles;
  name: string;
  description: string;
  useCamera: boolean;
  icon: string;
  tag: string;
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'aadhar_front',
    name: 'Aadhar Card (Front)',
    description: 'Upload front side of your Aadhar',
    useCamera: false,
    icon: 'card-outline',
    tag: 'ID Proof',
  },
  {
    id: 'aadhar_back',
    name: 'Aadhar Card (Back)',
    description: 'Upload back side of your Aadhar',
    useCamera: false,
    icon: 'card-outline',
    tag: 'ID Proof',
  },
  {
    id: 'driving_license',
    name: 'Driving License',
    description: 'Upload your driving license',
    useCamera: false,
    icon: 'document-outline',
    tag: 'License',
  },
  {
    id: 'vehicle_rc',
    name: 'Vehicle RC',
    description: 'Upload vehicle registration certificate',
    useCamera: false,
    icon: 'car-outline',
    tag: 'Vehicle',
  },
  {
    id: 'profile_photo',
    name: 'Profile Photo (Selfie)',
    description: 'Take a clear selfie in good lighting',
    useCamera: true,
    icon: 'camera-outline',
    tag: 'Photo',
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scaleAnim = useRef<Record<string, Animated.Value>>({}).current;
  DOCUMENTS.forEach(d => {
    if (!scaleAnim[d.id]) scaleAnim[d.id] = new Animated.Value(1);
  });

  const animateCard = (id: string) => {
    Animated.sequence([
      Animated.timing(scaleAnim[id], {
        toValue: 0.97,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim[id], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDocumentClick = useCallback(async (doc: DocItem) => {
    animateCard(doc.id);
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
    } catch {
      Alert.alert('Error', 'Failed to open camera or gallery.');
    }
  }, []);

  const uploadedCount = Object.values(fileUris).filter(Boolean).length;
  const allDocsUploaded = uploadedCount === DOCUMENTS.length;
  const progressPercent = Math.round((uploadedCount / DOCUMENTS.length) * 100);

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
            <Text style={styles.progressLabel}>Step 2 of 4</Text>
            <Text style={styles.progressPercent}>50%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: '50%'}]} />
          </View>
        </View>
      </View>

      {/* Title Block */}
      <View style={styles.titleBlock}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleBadgeText}>Document Upload</Text>
        </View>
        <Text style={styles.title}>Upload Your{'\n'}Documents</Text>
        <View style={styles.docProgressRow}>
          <Text style={styles.subtitle}>
            {uploadedCount} of {DOCUMENTS.length} documents uploaded
          </Text>
          <View style={styles.docProgressPill}>
            <Text style={styles.docProgressPillText}>{progressPercent}%</Text>
          </View>
        </View>
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
              <Animated.View
                key={doc.id}
                style={{transform: [{scale: scaleAnim[doc.id]}]}}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.documentCard,
                    isUploaded && styles.documentCardUploaded,
                  ]}
                  onPress={() => handleDocumentClick(doc)}>

                  {/* Left: Icon block */}
                  <View
                    style={[
                      styles.docIconBlock,
                      isUploaded && styles.docIconBlockSuccess,
                    ]}>
                    <Ionicons
                      name={isUploaded ? 'checkmark' : (doc.icon as any)}
                      size={moderateScale(22)}
                      color={isUploaded ? '#FFFFFF' : COLORS.primary}
                    />
                  </View>

                  {/* Center: Info */}
                  <View style={styles.documentInfo}>
                    <View style={styles.docNameRow}>
                      <Text
                        style={[
                          styles.documentName,
                          isUploaded && styles.documentNameSuccess,
                        ]}
                        numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <View
                        style={[
                          styles.docTag,
                          isUploaded && styles.docTagSuccess,
                        ]}>
                        <Text
                          style={[
                            styles.docTagText,
                            isUploaded && styles.docTagTextSuccess,
                          ]}>
                          {doc.tag}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.documentStatus,
                        isUploaded && styles.documentStatusSuccess,
                      ]}>
                      {isUploaded ? '✓ Uploaded successfully' : doc.description}
                    </Text>
                  </View>

                  {/* Right: Action chevron */}
                  <View
                    style={[
                      styles.docChevron,
                      isUploaded && styles.docChevronSuccess,
                    ]}>
                    <Ionicons
                      name={isUploaded ? 'checkmark-done' : (doc.useCamera ? 'camera' : 'cloud-upload-outline')}
                      size={moderateScale(16)}
                      color={isUploaded ? COLORS.success : COLORS.primary}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* License Details */}
          <View style={styles.licenseSection}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsDot} />
              <Text style={styles.sectionTitle}>License Details</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'licNum' && styles.inputWrapperFocused,
                ]}>
                <Ionicons
                  name="document-text-outline"
                  size={moderateScale(18)}
                  color={focusedField === 'licNum' ? COLORS.primary : '#9CA3AF'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. OD02-20220001234"
                  placeholderTextColor="#C4C9D4"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="characters"
                  onFocus={() => setFocusedField('licNum')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Expiry Date</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'licExp' && styles.inputWrapperFocused,
                ]}>
                <Ionicons
                  name="calendar-outline"
                  size={moderateScale(18)}
                  color={focusedField === 'licExp' ? COLORS.primary : '#9CA3AF'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (e.g. 2030-12-31)"
                  placeholderTextColor="#C4C9D4"
                  value={licenseExpiry}
                  onChangeText={setLicenseExpiry}
                  keyboardType="default"
                  onFocus={() => setFocusedField('licExp')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={moderateScale(18)}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.infoText}>
              Make sure photos are clear and all details are readable
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleContinue}
          activeOpacity={0.85}
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled,
          ]}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <View
            style={[
              styles.buttonArrow,
              !isFormValid && styles.buttonArrowDisabled,
            ]}>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color={isFormValid ? COLORS.primary : COLORS.disabled}
            />
          </View>
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

  // ─── Title Block ──────────────────────────────────────────────
  titleBlock: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  titleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(10),
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
  docProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  docProgressPill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(2),
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  docProgressPillText: {
    fontSize: moderateScale(11),
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },

  // ─── Scroll Content ───────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(130),
  },

  // ─── Document Cards ───────────────────────────────────────────
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: scale(14),
    borderRadius: moderateScale(18),
    marginBottom: verticalScale(12),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minHeight: verticalScale(76),
    gap: scale(12),
  },
  documentCardUploaded: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
    shadowColor: COLORS.success,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  docIconBlock: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  docIconBlockSuccess: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  documentInfo: {
    flex: 1,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(3),
    flexWrap: 'wrap',
  },
  documentName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  documentNameSuccess: {
    color: COLORS.success,
  },
  docTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(1),
  },
  docTagSuccess: {
    backgroundColor: '#DCFCE7',
  },
  docTagText: {
    fontSize: moderateScale(9),
    color: '#9CA3AF',
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  docTagTextSuccess: {
    color: COLORS.success,
  },
  documentStatus: {
    fontSize: moderateScale(12),
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  documentStatusSuccess: {
    color: COLORS.success,
    fontWeight: '500',
  },
  docChevron: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docChevronSuccess: {
    backgroundColor: '#DCFCE7',
  },

  // ─── License Section ──────────────────────────────────────────
  licenseSection: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(20),
    padding: scale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
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