import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useOnboardingStore} from '../store/onboardingStore';
import {getVerificationStatus} from '../services/driverService';
import {getMyVehicles} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface StatusState {
  driverStatus: VerificationStatus;
  driverMessage: string;
  vehicleStatus: VerificationStatus | null; // null = no vehicle yet
  vehicleNumber: string | null;
}

export default function KYCStatusScreen({navigation}: any) {
  const resetOnboarding = useOnboardingStore(s => s.reset);
  const [state, setState] = React.useState<StatusState | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      const [driverData, vehicles] = await Promise.all([
        getVerificationStatus(),
        getMyVehicles().catch(() => []),
      ]);

      const primaryVehicle = vehicles[0] ?? null;

      setState({
        driverStatus: driverData.verification_status,
        driverMessage: driverData.message,
        vehicleStatus: primaryVehicle
          ? (primaryVehicle.verification_status.toUpperCase() as VerificationStatus)
          : null,
        vehicleNumber: primaryVehicle?.registration_number ?? null,
      });
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resetOnboarding();
    fetchStatus();
  }, [resetOnboarding, fetchStatus]);

  const isDriverApproved = state?.driverStatus === 'APPROVED';
  const isDriverRejected = state?.driverStatus === 'REJECTED';
  const isVehicleApproved = state?.vehicleStatus === 'APPROVED';
  const isVehicleRejected = state?.vehicleStatus === 'REJECTED';
  const isVehiclePending =
    state?.vehicleStatus === 'PENDING' || state?.vehicleStatus === null;

  // Fully ready = both driver profile AND vehicle are approved
  const isFullyApproved = isDriverApproved && isVehicleApproved;
  const isAnyRejected = isDriverRejected || isVehicleRejected;

  const handlePress = () => {
    if (isFullyApproved) {
      navigation.replace('MainTabs');
    } else {
      fetchStatus();
    }
  };

  const headerIcon = isFullyApproved ? '✅' : isAnyRejected ? '❌' : '⏳';
  const headerTitle = isFullyApproved
    ? 'You\'re All Set!'
    : isAnyRejected
    ? 'Verification Failed'
    : 'Verification in Progress';

  const headerSubtitle = isFullyApproved
    ? 'Your profile and vehicle are verified. You can now start accepting rides.'
    : isVehicleRejected
    ? 'Your vehicle verification was rejected. Please contact support or re-submit your vehicle.'
    : isDriverRejected
    ? state?.driverMessage ||
      'Your profile verification was rejected. Please re-submit documents or contact support.'
    : isDriverApproved && isVehiclePending
    ? 'Your profile is verified! Waiting for vehicle verification to complete.'
    : state?.driverMessage ||
      'Your documents are being reviewed. This typically takes 24-48 hours.';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Checking status...</Text>
          </View>
        ) : (
          <>
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                isFullyApproved && styles.iconContainerSuccess,
                isAnyRejected && styles.iconContainerError,
              ]}>
              <Text style={styles.icon}>{headerIcon}</Text>
            </View>

            {/* Title & subtitle */}
            <Text style={styles.title}>{headerTitle}</Text>
            <Text style={styles.subtitle}>{headerSubtitle}</Text>

            {/* Status box */}
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxTitle}>Verification Checklist</Text>

              <StatusItem
                label="Documents Uploaded"
                status="completed"
              />

              <StatusItem
                label="Profile Verification"
                status={
                  isDriverApproved || isDriverRejected ? 'completed' : 'pending'
                }
                isError={isDriverRejected}
              />

              <StatusItem
                label="Profile Approved"
                status={isDriverApproved ? 'completed' : 'pending'}
                isError={isDriverRejected}
              />

              <StatusItem
                label={
                  state?.vehicleNumber
                    ? `Vehicle Verified (${state.vehicleNumber})`
                    : 'Vehicle Verified'
                }
                status={isVehicleApproved ? 'completed' : 'pending'}
                isError={isVehicleRejected}
                isWarning={
                  !isVehicleApproved && !isVehicleRejected && isDriverApproved
                }
              />
            </View>

            {/* Info cards for partial states */}
            {isDriverApproved && !isVehicleApproved && !isVehicleRejected && (
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>🚗</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Vehicle Pending</Text>
                  <Text style={styles.infoMessage}>
                    Your driver profile is approved! We're currently verifying
                    your vehicle. You'll be notified once it's done.
                  </Text>
                </View>
              </View>
            )}

            {isVehicleRejected && (
              <View style={[styles.infoCard, styles.infoCardError]}>
                <Text style={styles.infoIcon}>⚠️</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, styles.infoTitleError]}>
                    Vehicle Rejected
                  </Text>
                  <Text style={styles.infoMessage}>
                    Your vehicle documents could not be verified. Please contact
                    support for assistance.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!loading && (
        <TouchableOpacity
          style={[
            styles.button,
            isAnyRejected && styles.buttonError,
            !isFullyApproved && !isAnyRejected && styles.buttonPending,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {isFullyApproved ? 'Go to Dashboard' : 'Refresh Status'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const StatusItem = ({
  label,
  status,
  isError,
  isWarning,
}: {
  label: string;
  status: string;
  isError?: boolean;
  isWarning?: boolean;
}) => (
  <View style={styles.statusItem}>
    <View
      style={[
        styles.statusDot,
        status === 'completed' && !isError && styles.statusDotCompleted,
        isError && styles.statusDotError,
        isWarning && styles.statusDotWarning,
      ]}
    />
    <Text
      style={[
        styles.statusLabel,
        isError && styles.statusTextError,
        isWarning && styles.statusTextWarning,
      ]}>
      {label}
    </Text>
    <Text
      style={[
        styles.statusText,
        status === 'completed' && !isError && styles.statusTextCompleted,
        isError && styles.statusTextError,
        isWarning && styles.statusTextWarning,
      ]}>
      {isError ? '❌' : status === 'completed' ? '✓' : isWarning ? '⏳' : '○'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(30),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: verticalScale(300),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(15),
    color: '#8E8E93',
  },
  iconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    shadowColor: '#FFB800',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainerSuccess: {
    backgroundColor: '#E8F5E9',
    shadowColor: '#4CAF50',
  },
  iconContainerError: {
    backgroundColor: '#FFEBEE',
    shadowColor: '#F44336',
  },
  icon: {
    fontSize: moderateScale(isSmallDevice ? 45 : 50),
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 24 : 28),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(12),
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(32),
    paddingHorizontal: scale(10),
  },
  statusBox: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(16),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: verticalScale(20),
  },
  statusBoxTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: verticalScale(16),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    minHeight: verticalScale(28),
  },
  statusDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#E0E0E0',
    marginRight: scale(12),
  },
  statusDotCompleted: {
    backgroundColor: '#50C878',
  },
  statusDotError: {
    backgroundColor: '#F44336',
  },
  statusDotWarning: {
    backgroundColor: '#FFB800',
  },
  statusLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusText: {
    fontSize: moderateScale(16),
    color: '#E0E0E0',
  },
  statusTextCompleted: {
    color: '#50C878',
  },
  statusTextError: {
    color: '#F44336',
  },
  statusTextWarning: {
    color: '#FFB800',
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F4FD',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  infoCardError: {
    backgroundColor: '#FFF3CD',
  },
  infoIcon: {
    fontSize: moderateScale(24),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: verticalScale(4),
  },
  infoTitleError: {
    color: '#E65100',
  },
  infoMessage: {
    fontSize: moderateScale(13),
    color: '#5D5D5D',
    lineHeight: moderateScale(19),
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(30),
    minHeight: verticalScale(54),
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonError: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
  },
  buttonPending: {
    backgroundColor: '#FFB800',
    shadowColor: '#FFB800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
