import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { playBookingAlertSound, stopBookingAlertSound, releaseBookingAlertSound, pauseBookingAlertSound } from '../services/soundService';

const GMAPS_KEY = 'AIzaSyBk3embTThBzPAZBmSlIYue_JFHk2iBe9A';

const reverseGeocodeCoords = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}&result_type=sublocality%7Clocality&language=en`,
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.length > 0) {
      const comps: Array<{ types: string[]; short_name: string }> =
        data.results[0].address_components || [];
      const sub = comps.find(
        c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'),
      );
      const local = comps.find(c => c.types.includes('locality'));
      return sub?.short_name || local?.short_name || null;
    }
  } catch { }
  return null;
};
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/authStore';
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
import { rejectBooking } from '../services/driverService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Palette (matches Zipto theme) ───────────────────────────────────────────
const C = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  primary: '#1A56DB',
  primaryLight: '#EBF0FF',
  primaryMid: '#BFCFFF',
  headerBg: '#0F2D6B',
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  white: '#FFFFFF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#065F46',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberDark: '#92400E',
};

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
        style={[styles.sliderThumb, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}>
        <Ionicons name="chevron-forward" size={moderateScale(26)} color={C.white} />
      </Animated.View>
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [hasApprovedVehicle, setHasApprovedVehicle] = useState<boolean | null>(null);

  const [incomingBooking, setIncomingBooking] = useState<BookingOffer | null>(null);
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
    const bookingSnapshot = incomingBooking;
    dismissOffer();
    setIsAccepting(true);
    try {
      const vehicles = await getMyVehicles();
      if (!vehicles || vehicles.length === 0) {
        Alert.alert('No Vehicle', 'No registered vehicle found. Please add a vehicle first.');
        return;
      }
      const primaryVehicleId = vehicles[0].id;
      const result = await acceptBooking(bookingSnapshot.bookingId, primaryVehicleId);
      if (typeof result !== 'string') {
        fetchStats();
        navigation.navigate('Navigation', { bookingId: result.realBookingId });
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
    rejectBooking(bookingId);
  }, [incomingBooking, dismissOffer]);

  const { profile, setProfile, user } = useAuthStore();
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

  // ─── Always start offline on home screen load ─────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const [data, vehicles] = await Promise.all([
        getDriverProfile(),
        getMyVehicles().catch(() => []),
      ]);
      setProfile(data);

      // Always force offline when home screen loads
      setIsOnline(false);
      await updateAvailability({ availability_status: 'offline' });

      const approved = vehicles.some(
        v => v.verification_status?.toUpperCase() === 'APPROVED',
      );
      setHasApprovedVehicle(approved);
    } catch {/* non-critical */ }
  }, [setProfile]);

  const handleToggleOnline = async (value: boolean) => {
    if (isToggling) return;
    if (value && !hasApprovedVehicle) {
      Alert.alert(
        'Vehicle Not Verified',
        'You cannot go online until your vehicle has been verified by the admin. Please wait for approval.',
        [{ text: 'OK' }],
      );
      return;
    }
    setIsToggling(true);
    setIsOnline(value);
    try {
      const status = value ? 'online' : 'offline';
      const success = await updateAvailability({ availability_status: status });
      if (!success) {
        setIsOnline(!value);
        Alert.alert('Error', 'Failed to update availability status.');
      }
    } catch {
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
    } catch {/* non-critical */ }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    getNotifications()
      .then(notifs => setHasUnread(notifs.some(n => !n.read)))
      .catch(() => { });
    const now = new Date();
    getCalendar('month', now.getFullYear(), now.getMonth() + 1)
      .then(cal => setAttendanceSummary({
        days_present: cal.summary.days_present,
        total_days: cal.summary.total_days,
      }))
      .catch(() => { });
    // Get location name on mount
    Geolocation.getCurrentPosition(
      async pos => {
        const name = await reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude);
        if (name) { setLocationName(name); }
      },
      () => { },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 },
    );
  }, [fetchProfile, fetchStats]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingBooking?.bookingId]);

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
            message: 'App needs access to your location to update your position.',
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
      if (!isOnline) return;
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          try {
            await updateLocation({ latitude, longitude });
          } catch {/* non-critical */ }
        },
        _error => {/* geolocation error — silent */ },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
      );
    };
    if (isOnline) {
      syncLocation();
      intervalId = setInterval(syncLocation, 15000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline]);

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
          onNoDriversFound(_bookingId => { });
        }
      } else {
        offBookingOffer();
        offOfferExpired();
        offNoDriversFound();
        disconnectSocket();
      }
    };
    setupSocket();
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />

        <View style={styles.headerInner}>
          {/* Greeting */}
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>

          {/* Notification bell */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name="notifications-outline"
              size={moderateScale(22)}
              color={C.white}
            />
            {hasUnread && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        {/* ── Online Toggle inside header ─────────────────────────────── */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View
              style={[
                styles.onlineStatusDot,
                { backgroundColor: isOnline ? C.green : C.textMuted },
              ]}
            />
            <View>
              <Text style={styles.onlineTitle}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.onlineSubtitle}>
                {isOnline
                  ? 'Accepting new delivery requests'
                  : hasApprovedVehicle === false
                    ? 'Vehicle not verified yet'
                    : 'Toggle to start accepting orders'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            disabled={isToggling}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: C.green }}
            thumbColor={C.white}
            style={{
              transform: [
                { scaleX: Platform.OS === 'ios' ? 0.9 : 1 },
                { scaleY: Platform.OS === 'ios' ? 0.9 : 1 },
              ],
            }}
          />
        </View>
      </View>

      {/* ── Scroll Content ────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Vehicle not verified warning */}
        {hasApprovedVehicle === false && (
          <View style={styles.vehicleWarningBanner}>
            <View style={styles.warningIconWrap}>
              <Ionicons
                name="warning-outline"
                size={moderateScale(18)}
                color={C.amberDark}
              />
            </View>
            <Text style={styles.vehicleWarningText}>
              Your vehicle is pending verification. You can go online once the
              admin approves it.
            </Text>
          </View>
        )}

        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
        </View>

        <View style={styles.statsContainer}>
          {/* Orders */}
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: C.primaryLight }]}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={moderateScale(22)}
                color={C.primary}
              />
            </View>
            <Text style={styles.statValue}>{dailyStats.today_orders}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>

          {/* Divider */}
          <View style={styles.statDivider} />

          {/* Earnings */}
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: C.greenLight }]}>
              <Ionicons
                name="wallet-outline"
                size={moderateScale(22)}
                color={C.greenDark}
              />
            </View>
            <Text style={[styles.statValue, { color: C.green }]}>
              ₹{dailyStats.today_earnings}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* ── Idle / Status Card ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STATUS</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={[styles.statusIconWrap, { backgroundColor: isOnline ? C.greenLight : C.primaryLight }]}>
            <Ionicons
              name={isOnline ? 'radio-outline' : 'moon-outline'}
              size={moderateScale(26)}
              color={isOnline ? C.greenDark : C.primary}
            />
          </View>
          <Text style={styles.statusCardTitle}>
            {isOnline ? 'Waiting for Orders' : 'Currently Offline'}
          </Text>
          <Text style={styles.statusCardSub}>
            {isOnline
              ? 'Stay connected — new delivery requests will appear here automatically.'
              : 'Toggle the switch above to go online and start receiving delivery requests.'}
          </Text>
        </View>
      </ScrollView>

      {/* ── Incoming Booking Modal ────────────────────────────────────── */}
      <Modal visible={!!incomingBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(countdown / (incomingBooking?.timeLeft || 30)) * 100}%` as any,
                    backgroundColor: countdown <= 10 ? C.danger : C.primary,
                  },
                ]}
              />
            </View>

            {incomingBooking && (
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>New Delivery Request!</Text>
                    {incomingBooking.vehicleType && (
                      <Text style={styles.vehicleTypeText}>
                        {incomingBooking.vehicleType.replace('_', ' ').toUpperCase()}
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

                {/* Location card */}
                <View style={styles.detailsCard}>
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

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.modalLabel}>Distance</Text>
                    <Text style={styles.modalStatValue}>
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
                <View
                  style={[
                    styles.paidByOfferBadge,
                    incomingBooking.paid_by === 'receiver'
                      ? { backgroundColor: '#EDE9FE' }
                      : { backgroundColor: C.primaryLight },
                  ]}>
                  <Ionicons
                    name={
                      incomingBooking.paid_by === 'receiver'
                        ? 'person-outline'
                        : 'person'
                    }
                    size={moderateScale(14)}
                    color={
                      incomingBooking.paid_by === 'receiver'
                        ? '#7C3AED'
                        : C.primary
                    }
                  />
                  <Text
                    style={[
                      styles.paidByOfferText,
                      {
                        color:
                          incomingBooking.paid_by === 'receiver'
                            ? '#7C3AED'
                            : C.primary,
                      },
                    ]}>
                    {incomingBooking.paid_by === 'receiver'
                      ? 'Receiver Pays'
                      : 'Sender Pays'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={handleRejectBooking}
                    disabled={isAccepting}
                    activeOpacity={0.7}>
                    <Ionicons
                      name="close"
                      size={moderateScale(26)}
                      color={C.danger}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.headerBg,
    paddingTop: Platform.OS === 'ios' ? verticalScale(56) : verticalScale(44),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(24),
    overflow: 'hidden',
    borderBottomLeftRadius: moderateScale(32),
    borderBottomRightRadius: moderateScale(32),
  },
  decCircle1: {
    position: 'absolute',
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -scale(70),
    right: -scale(50),
  },
  decCircle2: {
    position: 'absolute',
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -scale(40),
    left: -scale(30),
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  headerLeft: {
    flex: 1,
    paddingRight: scale(12),
  },
  greeting: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.55)',
    marginTop: verticalScale(4),
    fontWeight: '500',
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
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badge: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(5),
    backgroundColor: C.danger,
    borderWidth: 1.5,
    borderColor: C.headerBg,
  },

  // ── Online Card (inside header) ───────────────────────────────────────────
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  onlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    flex: 1,
    paddingRight: scale(8),
  },
  onlineStatusDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    flexShrink: 0,
  },
  onlineTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.1,
  },
  onlineSubtitle: {
    fontSize: moderateScale(11.5),
    color: 'rgba(255,255,255,0.55)',
    marginTop: verticalScale(2),
    fontWeight: '400',
  },

  // ── Scroll content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: verticalScale(110),
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.4,
  },

  // ── Vehicle warning ───────────────────────────────────────────────────────
  vehicleWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.amberLight,
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    gap: scale(10),
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningIconWrap: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(8),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  vehicleWarningText: {
    flex: 1,
    fontSize: moderateScale(12.5),
    color: C.amberDark,
    lineHeight: moderateScale(18),
    fontWeight: '500',
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: scale(20),
    backgroundColor: C.surface,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(8),
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: verticalScale(16),
  },
  statIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  statValue: {
    fontSize: moderateScale(isSmallDevice ? 22 : 26),
    fontWeight: '800',
    color: C.text,
    marginBottom: verticalScale(2),
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: moderateScale(11.5),
    color: C.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Status idle card ──────────────────────────────────────────────────────
  statusCard: {
    backgroundColor: C.surface,
    marginHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    paddingVertical: verticalScale(28),
    paddingHorizontal: scale(24),
  },
  statusIconWrap: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  statusCardTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: C.text,
    marginBottom: verticalScale(8),
    letterSpacing: -0.2,
  },
  statusCardSub: {
    fontSize: moderateScale(13),
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(19),
    fontWeight: '400',
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: C.surface,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  progressTrack: {
    height: verticalScale(4),
    backgroundColor: C.border,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalContent: {
    padding: scale(24),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(18),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
  },
  vehicleTypeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: C.textMuted,
    marginTop: verticalScale(3),
    letterSpacing: 0.8,
  },
  countdownBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  countdownUrgentBadge: {
    backgroundColor: C.dangerLight,
    borderColor: '#FECACA',
  },
  countdownText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: C.primary,
  },
  countdownUrgentText: {
    color: C.danger,
  },
  detailsCard: {
    backgroundColor: C.bg,
    borderRadius: moderateScale(14),
    padding: scale(16),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: C.border,
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
    backgroundColor: C.green,
    marginTop: verticalScale(4),
  },
  dotDropoff: {
    width: moderateScale(12),
    height: moderateScale(12),
    backgroundColor: C.danger,
    marginTop: verticalScale(4),
  },
  connectingLine: {
    width: 2,
    height: verticalScale(20),
    backgroundColor: C.border,
    marginLeft: moderateScale(5),
    marginVertical: verticalScale(4),
  },
  modalLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: C.text,
    marginTop: verticalScale(2),
    lineHeight: moderateScale(20),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: moderateScale(14),
    padding: scale(16),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: C.border,
  },
  statBox: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: verticalScale(32),
    backgroundColor: C.border,
    marginHorizontal: scale(16),
  },
  earningsLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalStatValue: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: C.text,
    marginTop: verticalScale(4),
  },
  modalPrice: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: C.green,
    marginTop: verticalScale(4),
  },
  paidByOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(16),
  },
  paidByOfferText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  rejectButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: C.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sliderWrapper: {
    flex: 1,
  },

  // ── Swipe slider ──────────────────────────────────────────────────────────
  sliderContainer: {
    height: moderateScale(60),
    backgroundColor: C.primaryLight,
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  sliderTrack: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 1.2,
    marginLeft: moderateScale(24),
  },
  sliderThumb: {
    width: moderateScale(THUMB_SIZE),
    height: moderateScale(THUMB_SIZE),
    borderRadius: moderateScale(THUMB_SIZE / 2),
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});