import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  Animated,
  PanResponder,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {playBookingAlertSound, stopBookingAlertSound, releaseBookingAlertSound, pauseBookingAlertSound} from '../services/soundService';

const GMAPS_KEY = 'AIzaSyBk3embTThBzPAZBmSlIYue_JFHk2iBe9A';

const reverseGeocodeCoords = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}&result_type=sublocality%7Clocality&language=en`,
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.length > 0) {
      const comps: Array<{types: string[]; short_name: string}> =
        data.results[0].address_components || [];
      const sub = comps.find(
        c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'),
      );
      const local = comps.find(c => c.types.includes('locality'));
      return sub?.short_name || local?.short_name || null;
    }
  } catch {}
  return null;
};
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
  getNotifications,
  getCalendar,
} from '../services/driverService';
import {
  connectSocket,
  disconnectSocket,
  onBookingOffer,
  offBookingOffer,
  onOfferExpired,
  offOfferExpired,
  onNoDriversFound,
  offNoDriversFound,
  BookingOffer,
} from '../services/socketService';
import {rejectBooking} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Swipe-to-Accept Slider ───────────────────────────────────────────────────
const THUMB_SIZE = moderateScale(56);

const SwipeToAccept = ({
  onAccept,
  disabled,
}: {
  onAccept: () => void;
  disabled: boolean;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidthRef = useRef(0);
  const disabledRef = useRef(disabled);
  const onAcceptRef = useRef(onAccept);
  disabledRef.current = disabled;
  onAcceptRef.current = onAccept;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: (_, gs) =>
        !disabledRef.current && gs.dx > 2,
      onPanResponderMove: (_, gs) => {
        const maxX = containerWidthRef.current - THUMB_SIZE - 8;
        translateX.setValue(Math.max(0, Math.min(gs.dx, maxX)));
      },
      onPanResponderRelease: (_, gs) => {
        const maxX = containerWidthRef.current - THUMB_SIZE - 8;
        if (gs.dx >= maxX * 0.75) {
          Animated.timing(translateX, {
            toValue: maxX,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onAcceptRef.current();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View
      style={styles.sliderContainer}
      onLayout={e => {
        containerWidthRef.current = e.nativeEvent.layout.width;
      }}>
      <View style={styles.sliderTrack}>
        <Text style={styles.sliderText}>SLIDE TO ACCEPT  »</Text>
      </View>
      <Animated.View
        style={[styles.sliderThumb, {transform: [{translateX}]}]}
        {...panResponder.panHandlers}>
        <Ionicons name="chevron-forward" size={moderateScale(26)} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
};

export default function HomeScreen({navigation}: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [hasApprovedVehicle, setHasApprovedVehicle] = useState<boolean | null>(null);

  // Real-Time Booking State
  const [incomingBooking, setIncomingBooking] = useState<BookingOffer | null>(
    null,
  );
  const [isAccepting, setIsAccepting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(0);
  }, []);

  const dismissOffer = useCallback(() => {
    stopBookingAlertSound();
    clearCountdown();
    setIncomingBooking(null);
  }, [clearCountdown]);

  const handleAcceptBooking = async () => {
    if (!incomingBooking) return;

    // Optimistic: dismiss immediately so driver sees instant feedback
    const bookingSnapshot = incomingBooking;
    dismissOffer();
    setIsAccepting(true);

    try {
      const vehicles = await getMyVehicles();
      if (!vehicles || vehicles.length === 0) {
        Alert.alert(
          'No Vehicle',
          'No registered vehicle found. Please add a vehicle first.',
        );
        return;
      }

      const primaryVehicleId = vehicles[0].id;
      const result = await acceptBooking(
        bookingSnapshot.bookingId,
        primaryVehicleId,
      );

      if (typeof result !== 'string') {
        fetchStats();
        navigation.navigate('Navigation', {bookingId: result.realBookingId});
      } else {
        Alert.alert('Could Not Accept', result);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectBooking = useCallback(async () => {
    if (!incomingBooking) return;
    const bookingId = incomingBooking.bookingId;
    dismissOffer();
    // Fire-and-forget: tell backend to move to next driver immediately
    rejectBooking(bookingId);
  }, [incomingBooking, dismissOffer]);

  const initialRegion = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const {profile, setProfile, user} = useAuthStore();
  const [hasUnread, setHasUnread] = useState(false);
  const [dailyStats, setDailyStats] = useState({
    today_earnings: 0,
    today_orders: 0,
  });
  const [attendanceSummary, setAttendanceSummary] = useState({
    days_present: 0,
    total_days: 0,
  });
  const [locationName, setLocationName] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const [data, vehicles] = await Promise.all([
        getDriverProfile(),
        getMyVehicles().catch(() => []),
      ]);
      setProfile(data);
      if (data?.availability_status) {
        setIsOnline(data.availability_status.toLowerCase() === 'online');
      }
      const approved = vehicles.some(
        v => v.verification_status?.toUpperCase() === 'APPROVED',
      );
      setHasApprovedVehicle(approved);
    } catch {/* non-critical */}
  }, [setProfile]);

  const handleToggleOnline = async (value: boolean) => {
    if (isToggling) return;

    // Block going online if no approved vehicle
    if (value && !hasApprovedVehicle) {
      Alert.alert(
        'Vehicle Not Verified',
        'You cannot go online until your vehicle has been verified by the admin. Please wait for approval.',
        [{text: 'OK'}],
      );
      return;
    }

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
    } catch {
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
    } catch {/* non-critical */}
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    getNotifications()
      .then(notifs => setHasUnread(notifs.some(n => !n.read)))
      .catch(() => {});
    const now = new Date();
    getCalendar('month', now.getFullYear(), now.getMonth() + 1)
      .then(cal => setAttendanceSummary({
        days_present: cal.summary.days_present,
        total_days: cal.summary.total_days,
      }))
      .catch(() => {});
    // Get location name on mount
    Geolocation.getCurrentPosition(
      async pos => {
        const name = await reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude);
        if (name) {setLocationName(name);}
      },
      () => {},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 120000},
    );
  }, [fetchProfile, fetchStats]);

  // Countdown timer — starts fresh on each new offer, auto-dismisses at 0
  useEffect(() => {
    if (!incomingBooking) {
      clearCountdown();
      return;
    }
    const seconds = incomingBooking.timeLeft > 0 ? incomingBooking.timeLeft : 30;
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          // Offer expired on client side — dismiss silently (server handles next driver)
          setIncomingBooking(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    // Re-run only when a new offer arrives (bookingId changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingBooking?.bookingId]);

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
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          try {
            await updateLocation({latitude, longitude});
          } catch {/* non-critical */}
        },
        _error => {/* geolocation error — silent */},
        {enableHighAccuracy: false, timeout: 20000, maximumAge: 10000},
      );
    };

    // Fetch location name once when online (for header display)
    if (isOnline) {
      Geolocation.getCurrentPosition(
        async position => {
          const name = await reverseGeocodeCoords(
            position.coords.latitude,
            position.coords.longitude,
          );
          if (name) {setLocationName(name);}
        },
        () => {},
        {enableHighAccuracy: false, timeout: 10000, maximumAge: 60000},
      );
    }

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
      if (isOnline) {
        const activeToken = useAuthStore.getState().token;
        if (activeToken) {
          connectSocket(activeToken);
          onBookingOffer(offer => {
            setIncomingBooking(offer);
            // Play booking alert sound safely with error handling
            playBookingAlertSound().catch(err =>
              console.warn('[HomeScreen] Failed to play booking sound:', err),
            );
          });
          onOfferExpired(_bookingId => dismissOffer());
          onNoDriversFound(_bookingId => {
            // No-op for driver side — server already handles this
          });
        }
      } else {
        offBookingOffer();
        offOfferExpired();
        offNoDriversFound();
        disconnectSocket();
      }
    };

    // Initial setup
    setupSocket();

    // Reattach when coming from background back to active
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isOnline) {
        setupSocket();
      }
    });

    return () => {
      subscription.remove();
      offBookingOffer();
      offOfferExpired();
      offNoDriversFound();
      disconnectSocket();
      pauseBookingAlertSound();
    };
  }, [isOnline, dismissOffer]);

  // Cleanup sound resources on component unmount
  useEffect(() => {
    return () => {
      releaseBookingAlertSound();
    };
  }, []);

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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
          <Text style={styles.date}>{currentDate}</Text>
          {locationName ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={moderateScale(13)} color="#3B82F6" />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="notifications-outline"
            size={moderateScale(24)}
            color="#3B82F6"
          />
          {hasUnread && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Online Toggle Card */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineCardLeft}>
            <Text style={styles.onlineTitle}>Go Online</Text>
            <Text style={styles.onlineSubtitle}>
              {isOnline
                ? 'Accepting orders'
                : hasApprovedVehicle === false
                ? 'Vehicle not verified yet'
                : 'Start accepting orders'}
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

        {/* Vehicle not verified warning */}
        {hasApprovedVehicle === false && (
          <View style={styles.vehicleWarningBanner}>
            <Ionicons name="warning-outline" size={moderateScale(16)} color="#E65100" />
            <Text style={styles.vehicleWarningText}>
              Your vehicle is pending verification. You can go online once the admin approves it.
            </Text>
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

        {/* Attendance | Rating | Feedback */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCardSm}
            onPress={() => navigation.navigate('Attendance')}
            activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={moderateScale(24)} color="#F59E0B" />
            <Text style={styles.statValueSm}>
              {attendanceSummary.days_present}/{attendanceSummary.total_days}
            </Text>
            <Text style={styles.statLabelSm}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCardSm}
            onPress={() => navigation.navigate('RatingsReviews')}
            activeOpacity={0.7}>
            <Ionicons name="star-outline" size={moderateScale(24)} color="#F59E0B" />
            <Text style={styles.statValueSm}>
              {Number(profile?.average_rating ?? 0) > 0
                ? Number(profile?.average_rating).toFixed(1)
                : 'New'}
            </Text>
            <Text style={styles.statLabelSm}>Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCardSm}
            onPress={() => navigation.navigate('RatingsReviews')}
            activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={moderateScale(24)} color="#3B82F6" />
            <Text style={styles.statValueSm}>{profile?.total_ratings ?? 0}</Text>
            <Text style={styles.statLabelSm}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Incoming Booking Modal */}
      <Modal visible={!!incomingBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Progress bar — full width at the very top */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(countdown / (incomingBooking?.timeLeft || 30)) * 100}%` as any,
                    backgroundColor: countdown <= 10 ? '#FF3B30' : '#007AFF',
                  },
                ]}
              />
            </View>

            {incomingBooking && (
              <View style={styles.modalContent}>
                {/* Header: title + vehicle type | countdown badge */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>New Delivery Request!</Text>
                    {incomingBooking.vehicleType && (
                      <Text style={styles.vehicleTypeText}>
                        {incomingBooking.vehicleType
                          .replace('_', ' ')
                          .toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.countdownBadge,
                      countdown <= 10 && styles.countdownUrgentBadge,
                    ]}>
                    <Text
                      style={[
                        styles.countdownText,
                        countdown <= 10 && styles.countdownUrgentText,
                      ]}>
                      {countdown}s
                    </Text>
                  </View>
                </View>

                {/* Location details card */}
                <View style={styles.detailsCard}>
                  {/* Pickup row */}
                  <View style={styles.modalRow}>
                    <View>
                      <View style={styles.dotPickup} />
                      <View style={styles.connectingLine} />
                    </View>
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.modalLabel}>Pickup</Text>
                      <Text style={styles.modalValue} numberOfLines={2}>
                        {incomingBooking.pickup}
                      </Text>
                    </View>
                  </View>
                  {/* Dropoff row */}
                  <View style={styles.modalRow}>
                    <View style={styles.dotDropoff} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.modalLabel}>Dropoff</Text>
                      <Text style={styles.modalValue} numberOfLines={2}>
                        {incomingBooking.drop}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats: distance | earnings */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.modalLabel}>Distance</Text>
                    <Text style={styles.statValue}>
                      {incomingBooking.distance} km
                    </Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.earningsLabel}>Your Earnings</Text>
                    <Text style={styles.modalPrice}>
                      ₹{incomingBooking.fare}
                    </Text>
                  </View>
                </View>

                {/* Paid by badge */}
                <View style={[
                  styles.paidByOfferBadge,
                  incomingBooking.paid_by === 'receiver'
                    ? {backgroundColor: '#EDE9FE'}
                    : {backgroundColor: '#E0F2FE'},
                ]}>
                  <Ionicons
                    name={incomingBooking.paid_by === 'receiver' ? 'person-outline' : 'person'}
                    size={moderateScale(14)}
                    color={incomingBooking.paid_by === 'receiver' ? '#7C3AED' : '#0369A1'}
                  />
                  <Text style={[
                    styles.paidByOfferText,
                    {color: incomingBooking.paid_by === 'receiver' ? '#7C3AED' : '#0369A1'},
                  ]}>
                    {incomingBooking.paid_by === 'receiver'
                      ? 'Receiver Pays'
                      : 'Sender Pays'}
                  </Text>
                </View>

                {/* Actions: circular reject + swipe to accept */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={handleRejectBooking}
                    disabled={isAccepting}
                    activeOpacity={0.7}>
                    <Ionicons
                      name="close"
                      size={moderateScale(28)}
                      color="#FF3B30"
                    />
                  </TouchableOpacity>
                  <View style={styles.sliderWrapper}>
                    <SwipeToAccept
                      onAccept={handleAcceptBooking}
                      disabled={isAccepting}
                    />
                  </View>
                </View>
              </View>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(3),
    gap: scale(3),
  },
  locationText: {
    fontSize: moderateScale(13),
    color: '#3B82F6',
    fontWeight: '600',
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
  vehicleWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: moderateScale(10),
    padding: scale(12),
    marginTop: verticalScale(8),
    gap: scale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#E65100',
  },
  vehicleWarningText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#E65100',
    lineHeight: moderateScale(18),
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
  statCardSm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(14),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    gap: verticalScale(4),
  },
  statValueSm: {
    fontSize: moderateScale(isSmallDevice ? 16 : 18),
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  statLabelSm: {
    fontSize: moderateScale(11),
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
    overflow: 'hidden',
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  progressTrack: {
    height: verticalScale(6),
    backgroundColor: '#E5E5EA',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  modalContent: {
    padding: scale(24),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
  },
  vehicleTypeText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: verticalScale(4),
  },
  countdownBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  countdownUrgentBadge: {
    backgroundColor: '#FFEBEA',
  },
  countdownText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#007AFF',
  },
  countdownUrgentText: {
    color: '#FF3B30',
  },
  detailsCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(4),
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  dotPickup: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#34C759',
    marginTop: verticalScale(4),
  },
  dotDropoff: {
    width: moderateScale(12),
    height: moderateScale(12),
    backgroundColor: '#FF3B30',
    marginTop: verticalScale(4),
  },
  connectingLine: {
    width: 2,
    height: verticalScale(20),
    backgroundColor: '#D1D1D6',
    marginLeft: moderateScale(5),
    marginVertical: verticalScale(4),
  },
  modalLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: verticalScale(2),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  statBox: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: verticalScale(30),
    backgroundColor: '#D1D1D6',
    marginHorizontal: scale(16),
  },
  earningsLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#34C759',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalPrice: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#34C759',
    marginTop: verticalScale(4),
  },
  paidByOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
  },
  paidByOfferText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejectButton: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderContainer: {
    height: moderateScale(64),
    backgroundColor: '#E5F1FF',
    borderRadius: moderateScale(32),
    justifyContent: 'center',
    padding: 4,
  },
  sliderTrack: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 1,
    marginLeft: moderateScale(20),
  },
  sliderThumb: {
    width: moderateScale(THUMB_SIZE),
    height: moderateScale(THUMB_SIZE),
    borderRadius: moderateScale(THUMB_SIZE / 2),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

