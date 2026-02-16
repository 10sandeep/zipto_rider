import React, { useState } from 'react';
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
  Image,
  Dimensions,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

interface Document {
  id: string;
  name: string;
  uploaded: boolean;
  useCamera: boolean;
}

/* 🎨 Color System */
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

/* 🔐 Camera Permission */
const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'Camera access is required to take your selfie',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export default function DocumentUploadScreen({ route, navigation }: any) {
  const { vehicleType } = route.params;

  const [documents, setDocuments] = useState<Document[]>([
    { id: 'aadhar', name: 'Aadhar Card', uploaded: false, useCamera: false },
    { id: 'license', name: 'Driving License', uploaded: false, useCamera: false },
    { id: 'insurance', name: 'Vehicle Insurance', uploaded: false, useCamera: false },
    { id: 'photo', name: 'Profile Photo (Selfie)', uploaded: false, useCamera: true },
  ]);

  /* 📸 Document Click Handler */
  const handleDocumentClick = async (doc: Document) => {
    try {
      if (doc.useCamera) {
        // 🔴 REQUEST CAMERA PERMISSION
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Camera permission is required');
          return;
        }

        // 🔴 OPEN FRONT CAMERA
        const result = await launchCamera({
          mediaType: 'photo',
          cameraType: 'front',
          quality: 0.8,
          saveToPhotos: true,
        });

        if (result.didCancel) return;

        if (result.assets?.[0]?.uri) {
          uploadDocument(doc.id, result.assets[0].uri);
        }
      } else {
        // 📎 OPEN GALLERY
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (result.didCancel) return;

        if (result.assets?.[0]?.uri) {
          uploadDocument(doc.id, result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to open camera or gallery');
    }
  };

  const uploadDocument = (docId: string, uri: string) => {
    console.log(`Uploading ${docId}:`, uri);

    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, uploaded: true } : doc
      )
    );
  };

  const handleContinue = () => {
    const allUploaded = documents.every(doc => doc.uploaded);

    if (!allUploaded) {
      Alert.alert('Missing Documents', 'Please upload all required documents');
      return;
    }

    navigation.navigate('ProfileSetup');
  };

  const uploadedCount = documents.filter(d => d.uploaded).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={navigation.goBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={moderateScale(22)} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>
          Progress: {uploadedCount} of {documents.length} completed
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {documents.map(doc => (
          <TouchableOpacity
            key={doc.id}
            activeOpacity={0.85}
            style={[
              styles.documentCard,
              doc.uploaded && styles.documentCardUploaded,
            ]}
            onPress={() => handleDocumentClick(doc)}
          >
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <Text style={styles.documentStatus}>
                {doc.uploaded
                  ? 'Uploaded successfully'
                  : doc.useCamera
                  ? 'Take a selfie'
                  : 'Upload document'}
              </Text>
            </View>

            <View
              style={[
                styles.uploadIcon,
                doc.uploaded && styles.uploadIconSuccess,
              ]}
            >
              {doc.uploaded ? (
                <Ionicons name="checkmark" size={moderateScale(24)} color="#FFFFFF" />
              ) : doc.useCamera ? (
                <Ionicons name="camera" size={moderateScale(24)} color={COLORS.primary} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={moderateScale(24)} color={COLORS.primary} />
              )}
            </View>
          </TouchableOpacity>
        ))}

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

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={uploadedCount !== documents.length}
          onPress={handleContinue}
          activeOpacity={0.8}
          style={[
            styles.continueButton,
            uploadedCount !== documents.length &&
              styles.continueButtonDisabled,
          ]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* 🎨 Styles */
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
  backIcon: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: COLORS.primary,
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
    shadowOffset: { width: 0, height: 2 },
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
  uploadIconText: {
    fontSize: moderateScale(20),
  },
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
    paddingBottom: Platform.OS === 'ios' ? verticalScale(36) : verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
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
    shadowOffset: { width: 0, height: 4 },
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