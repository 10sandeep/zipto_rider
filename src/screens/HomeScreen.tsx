import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
  Alert,
  PermissionsAndroid,
  Modal,
  AppState,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuthStore} from '../store/authStore';
import {
  getDriverProfile,
  getDailyStats,
  updateAvailability,
  updateLocation,
  getMyVehicles,
  acceptBooking,
} from '../services/driverService';
import {
  connectSocket,
  disconnectSocket,
  onBookingOffer,
  offBookingOffer,
  BookingOffer,
} from '../services/socketService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

export default function HomeScreen({navigation}: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Real-Time Booking State
  const [incomingBooking, setIncomingBooking] = useState<BookingOffer | null>(
    null,
  );
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptBooking = async () => {
    if (!incomingBooking) return;
    setIsAccepting(true);

    try {
      // 1. Fetch available active vehicles dynamically
      const vehicles = await getMyVehicles();
      if (!vehicles || vehicles.length === 0) {
        Alert.alert(
          'Error',
          'No registered vehicle found. Please add a vehicle first.',
        );
        setIsAccepting(false);
        return;
      }

      // We choose the primary / first registered vehicle id
      const primaryVehicleId = vehicles[0].id;

      const success = await acceptBooking(
        incomingBooking.bookingId,
        primaryVehicleId,
      );
      if (success) {
        Alert.alert('Success', 'Booking accepted!');
        setIncomingBooking(null);
        // Navigate or refresh state context...
      } else {
        Alert.alert(
          'Error',
          'Failed to accept booking. It may have been taken by another driver.',
        );
        setIncomingBooking(null);
      }
    } catch (err) {
      console.log('Accept booking error:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectBooking = () => {
    setIncomingBooking(null);
  };

  const initialRegion = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const {profile, setProfile, user} = useAuthStore();
  const [dailyStats, setDailyStats] = useState({
    today_earnings: 0,
    today_orders: 0,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getDriverProfile();
      setProfile(data);
      if (data?.availability_status) {
        setIsOnline(data.availability_status.toLowerCase() === 'online');
      }
    } catch (error) {
      console.log('[HomeScreen] Failed to fetch profile:', error);
    }
  }, [setProfile]);

  const handleToggleOnline = async (value: boolean) => {
    if (isToggling) return;
    setIsToggling(true);
    // Optimistic UI update
    setIsOnline(value);

    try {
      const status = value ? 'online' : 'offline';
      const success = await updateAvailability({availability_status: status});
      if (!success) {
        // Revert on failure
        setIsOnline(!value);
        Alert.alert('Error', 'Failed to update availability status.');
      }
    } catch (error) {
      console.log('[HomeScreen] Failed to update availability:', error);
      // Revert on failure
      setIsOnline(!value);
      Alert.alert('Error', 'Failed to update availability status.');
    } finally {
      setIsToggling(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const stats = await getDailyStats();
      setDailyStats({
        today_earnings: stats.today_earnings || 0,
        today_orders: stats.today_orders || 0,
      });
    } catch (error) {
      console.log('[HomeScreen] Failed to fetch daily stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  // Background Location Syncer (Only when Online)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
        return true;
      }
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'App needs access to your location to update your position.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    const syncLocation = async () => {
      if (!isOnline) return; // Do not strictly poll location if offline

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('[HomeScreen] Location permission denied.');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          try {
            await updateLocation({latitude, longitude});
            console.log(
              `[HomeScreen] Location synced for ST_DWithin tracking: ${latitude}, ${longitude}`,
            );
          } catch (error) {
            console.log('[HomeScreen] Failed to sync location:', error);
          }
        },
        error => {
          console.log('[HomeScreen] Geolocation error:', error);
        },
        {enableHighAccuracy: false, timeout: 20000, maximumAge: 10000},
      );
    };

    if (isOnline) {
      // Force an immediate sync when toggled online
      syncLocation();
      // ST_DWithin Tracking Loop - 15 seconds
      intervalId = setInterval(syncLocation, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline]);

  // Web Socket Lifecycles
  useEffect(() => {
    const setupSocket = () => {
      // If the driver turns the switch ON and we have a token, connect and listen.
      if (isOnline) {
        const activeToken = useAuthStore.getState().token;
        if (activeToken) {
          connectSocket(activeToken);
          onBookingOffer(offer => {
            setIncomingBooking(offer);
          });
        }
      } else {
        // Offline: tear down connections globally
        offBookingOffer();
        disconnectSocket();
      }
    };

    // Initial setup
    setupSocket();

    // Reattach when coming from background back to active
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isOnline) {
        console.log(
          '[HomeScreen] App came to foreground, restoring socket listener...',
        );
        // Ensure listener exists and reconnect only if socket is currently down.
        setupSocket();
      }
    });

    return () => {
      subscription.remove();
      offBookingOffer();
      disconnectSocket();
    };
  }, [isOnline]);

  const displayName = profile?.name || user?.name || 'Partner';
  const firstName = displayName.split(' ')[0];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map Background */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        {isOnline && (
          <>
            {/* Pickup Marker */}
            <Marker coordinate={currentOrder.pickupCoords}>
              <View style={styles.markerContainer}>
                <View style={styles.pickupMarker}>
                  <Ionicons name="location" size={moderateScale(24)} color="#FFFFFF" />
                </View>
                <View style={styles.markerCallout}>
                  <Text style={styles.markerText}>Pickup</Text>
                  <Text style={styles.markerAddress}>{currentOrder.pickup}</Text>
                </View>
              </View>
            </Marker>

            {/* Delivery Marker */}
            <Marker coordinate={currentOrder.deliveryCoords}>
              <View style={styles.deliveryMarker}>
                <Ionicons name="flag" size={moderateScale(20)} color="#FFFFFF" />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="notifications-outline" size={moderateScale(24)} color="#3B82F6" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Content Overlay */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Online Toggle Card */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineCardLeft}>
            <Text style={styles.onlineTitle}>Go Online</Text>
            <Text style={styles.onlineSubtitle}>
              {isOnline ? 'Accepting orders' : 'Start accepting orders'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            disabled={isToggling}
            trackColor={{false: '#E0E0E0', true: '#3B82F6'}}
            thumbColor="#FFFFFF"
            style={{transform: [{scaleX: Platform.OS === 'ios' ? 0.9 : 1}, {scaleY: Platform.OS === 'ios' ? 0.9 : 1}]}}
          />
        </View>

        {/* Active Order Card */}
        {isOnline && (
          <View style={styles.currentOrderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={moderateScale(24)}
                  color="#3B82F6"
                />
                <Text style={styles.currentOrderTitle}>Active Order</Text>
              </View>
              <View style={styles.amountBadge}>
                <Text style={styles.amountText}>{currentOrder.amount}</Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Ionicons name="location" size={moderateScale(18)} color="#3B82F6" />
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>Pickup</Text>
                  <Text style={styles.orderValue}>{currentOrder.pickup}</Text>
                </View>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.orderRow}>
                <Ionicons name="flag" size={moderateScale(18)} color="#16A34A" />
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>Delivery</Text>
                  <Text style={styles.orderValue}>{currentOrder.delivery}</Text>
                </View>
              </View>

              <View style={styles.distanceRow}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={moderateScale(18)}
                  color="#8E8E93"
                />
                <Text style={styles.distanceText}>{currentOrder.distance}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: currentOrder.id})
              }
              activeOpacity={0.8}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="arrow-forward" size={moderateScale(18)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={moderateScale(28)}
                color="#3B82F6"
              />
            </View>
            <Text style={styles.statValue}>{dailyStats.today_orders}</Text>
            <Text style={styles.statLabel}>Today's Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet-outline" size={moderateScale(28)} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>₹{dailyStats.today_earnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
        </View>
      </ScrollView>

      {/* Incoming Booking Modal */}
      <Modal visible={!!incomingBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Ride Request! 🚕</Text>
            {incomingBooking && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Pickup:</Text>
                  <Text style={styles.modalValue}>
                    {incomingBooking.pickup}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Dropoff:</Text>
                  <Text style={styles.modalValue}>{incomingBooking.drop}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Distance:</Text>
                  <Text style={styles.modalValue}>
                    {incomingBooking.distance} km
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Est. Earnings:</Text>
                  <Text style={styles.modalPrice}>₹{incomingBooking.fare}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={handleRejectBooking}
                    disabled={isAccepting}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.acceptButton]}
                    onPress={handleAcceptBooking}
                    disabled={isAccepting}>
                    <Text style={styles.acceptButtonText}>
                      {isAccepting ? 'Accepting...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(20),
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    color: '#1C1C1E',
  },
  date: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    marginTop: verticalScale(4),
  },
  notificationButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100),
  },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: verticalScale(80),
  },
  onlineCardLeft: {
    flex: 1,
    paddingRight: scale(12),
  },
  onlineTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  onlineSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Regular',
    color: '#8E8E93',
  },
  currentOrderCard: {
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(16),
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    flex: 1,
    paddingRight: scale(8),
  },
  currentOrderTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
  },
  amountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  amountText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
  },
  orderInfo: {
    marginBottom: verticalScale(16),
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  orderTextContainer: {
    flex: 1,
  },
  orderLabel: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  orderValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    lineHeight: moderateScale(20),
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: verticalScale(8),
    marginLeft: scale(32),
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  distanceText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  viewDetailsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
    minHeight: verticalScale(50),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(16),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: scale(20),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    minHeight: verticalScale(120),
  },
  statIconContainer: {
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(13),
    color: '#8E8E93',
    textAlign: 'center',
  },
  // Map Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  pickupMarker: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryMarker: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerCallout: {
    backgroundColor: '#FFFFFF',
    padding: scale(12),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
    minWidth: scale(150),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6',
    marginBottom: verticalScale(4),
  },
  markerAddress: {
    fontSize: moderateScale(11),
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },


  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: scale(20),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  modalLabel: {
    fontSize: moderateScale(16),
    color: '#8E8E93',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: moderateScale(16),
    color: '#1C1C1E',
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
    marginLeft: scale(10),
  },
  modalPrice: {
    fontSize: moderateScale(20),
    color: '#16A34A',
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(24),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
});

