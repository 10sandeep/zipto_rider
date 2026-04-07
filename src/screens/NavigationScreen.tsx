import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Linking,
  Animated,
  PanResponder,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getDriverActiveBooking,
  startTrip,
  completeTrip,
  resendDeliveryOtp,
  ActiveBooking,
  CompleteTripResult,
} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (s: number) => (SCREEN_WIDTH / 375) * s;
const verticalScale = (s: number) => (SCREEN_HEIGHT / 812) * s;
const moderateScale = (s: number, f = 0.5) => s + (scale(s) - s) * f;
const fmt = (n: number) =>
  '₹' +
  Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

type TripStep = 'going_to_pickup' | 'delivering';
type PaymentChoice = 'cash' | 'online' | null;
type DeliveryStep = 'payment' | 'otp';

const buildUpiUrl = (amount: number, bookingId: string) =>
  `upi://pay?pa=zipto@upi&pn=Zipto%20Delivery&am=${amount.toFixed(
    2,
  )}&cu=INR&tn=Booking%20${bookingId.slice(-6).toUpperCase()}`;

const buildQrImageUrl = (upiUrl: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUrl,
  )}`;

// ── Slide To Confirm Component ─────────────────────────────────────────────
const THUMB_SIZE = moderateScale(52);
const SLIDE_THRESHOLD = 0.82;

function SlideToConfirm({
  label,
  onSlideComplete,
  color = '#16A34A',
  disabled = false,
  loading = false,
  icon = 'chevron-forward',
}: {
  label: string;
  onSlideComplete: () => void;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const sliderWidth = useRef(0);
  const hasTriggered = useRef(false);

  // Animated opacity for the label text (fades as thumb moves right)
  const labelOpacity = translateX.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Animated opacity for the trail fill
  const fillWidth = translateX.interpolate({
    inputRange: [0, 300],
    outputRange: [THUMB_SIZE, 300 + THUMB_SIZE],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !loading,
      onMoveShouldSetPanResponder: () => !disabled && !loading,
      onPanResponderGrant: () => {
        hasTriggered.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (hasTriggered.current) return;
        const maxX = sliderWidth.current - THUMB_SIZE;
        const newX = Math.max(0, Math.min(gestureState.dx, maxX));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (hasTriggered.current) return;
        const maxX = sliderWidth.current - THUMB_SIZE;
        if (gestureState.dx >= maxX * SLIDE_THRESHOLD) {
          hasTriggered.current = true;
          Animated.spring(translateX, {
            toValue: maxX,
            useNativeDriver: false,
            tension: 60,
            friction: 8,
          }).start(() => {
            onSlideComplete();
            // Reset after a brief pause so it feels responsive
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: false,
                tension: 60,
                friction: 8,
              }).start(() => {
                hasTriggered.current = false;
              });
            }, 300);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 80,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  const trackBg = disabled || loading ? '#D1D5DB' : '#E8F5E9';
  const thumbBg = disabled || loading ? '#9CA3AF' : color;

  return (
    <View
      style={[sliderStyles.track, {backgroundColor: trackBg}]}
      onLayout={e => {
        sliderWidth.current = e.nativeEvent.layout.width;
      }}>
      {/* Animated fill behind the thumb */}
      <Animated.View
        style={[
          sliderStyles.fill,
          {
            width: fillWidth,
            backgroundColor: disabled || loading ? '#D1D5DB' : color + '28',
          },
        ]}
      />

      {/* Label text */}
      <Animated.Text style={[sliderStyles.trackLabel, {opacity: labelOpacity}]}>
        {label}
      </Animated.Text>

      {/* Chevrons hint */}
      <Animated.View
        style={[sliderStyles.chevronHint, {opacity: labelOpacity}]}>
        <Ionicons
          name="chevron-forward"
          size={moderateScale(14)}
          color={disabled ? '#9CA3AF' : color + '80'}
        />
        <Ionicons
          name="chevron-forward"
          size={moderateScale(14)}
          color={disabled ? '#9CA3AF' : color + '50'}
        />
      </Animated.View>

      {/* Draggable Thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          sliderStyles.thumb,
          {
            backgroundColor: thumbBg,
            transform: [{translateX}],
          },
        ]}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons
            name={icon as any}
            size={moderateScale(22)}
            color="#FFFFFF"
          />
        )}
      </Animated.View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: moderateScale(30),
  },
  trackLabel: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: THUMB_SIZE + scale(8),
  },
  chevronHint: {
    position: 'absolute',
    right: scale(18),
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    left: moderateScale(4),
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});

// ── OTP Box Input Component ────────────────────────────────────────────────
const OTP_LENGTH = 6;

function OtpBoxInput({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
}) {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newVal = value.split('');
    newVal[index] = digit;
    const joined = newVal.join('').slice(0, OTP_LENGTH);
    onChange(joined);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newVal = value.split('');
        newVal[index - 1] = '';
        onChange(newVal.join(''));
        inputs.current[index - 1]?.focus();
      } else {
        const newVal = value.split('');
        newVal[index] = '';
        onChange(newVal.join(''));
      }
    }
  };

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(digits);
      const lastIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputs.current[lastIndex]?.focus();
    } else {
      handleChange(text, index);
    }
  };

  return (
    <View style={otpBoxStyles.row}>
      {Array.from({length: OTP_LENGTH}).map((_, i) => (
        <TextInput
          key={i}
          ref={ref => {
            inputs.current[i] = ref;
          }}
          style={[otpBoxStyles.box, value[i] ? otpBoxStyles.boxFilled : null]}
          value={value[i] || ''}
          onChangeText={text => handleChangeText(text, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus={autoFocus && i === 0}
          selectTextOnFocus
          caretHidden
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
}

const otpBoxStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(8),
    marginBottom: verticalScale(20),
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: moderateScale(52),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: moderateScale(12),
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    backgroundColor: '#F8FAFF',
  },
  boxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
});

// ── Main Screen ────────────────────────────────────────────────────────────
export default function NavigationScreen({route, navigation}: any) {
  const bookingId: string = route.params?.bookingId ?? '';
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<TripStep>('going_to_pickup');
  const [starting, setStarting] = useState(false);

  // Pickup OTP modal
  const [pickupOtpModalVisible, setPickupOtpModalVisible] = useState(false);
  const [pickupOtpInput, setPickupOtpInput] = useState('');

  // Toll state
  const [hasToll, setHasToll] = useState(false);
  const [tollAmountText, setTollAmountText] = useState('');

  // Delivery modal state
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState<DeliveryStep>('payment');
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>(null);
  const [otpInput, setOtpInput] = useState('');
  const [completing, setCompleting] = useState(false);

  // Trip summary modal
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [tripResult, setTripResult] = useState<CompleteTripResult | null>(null);

  // Resend delivery OTP
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Map state
  const mapRef = useRef<MapView>(null);
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Track driver's current location
  useEffect(() => {
    const applyPosition = (pos: any) => {
      const lat = pos?.coords?.latitude;
      const lng = pos?.coords?.longitude;
      if (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        isFinite(lat) &&
        isFinite(lng)
      ) {
        setDriverLocation({latitude: lat, longitude: lng});
      }
    };
    Geolocation.getCurrentPosition(applyPosition, () => {}, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30000,
    });
    const watchId = Geolocation.watchPosition(applyPosition, () => {}, {
      enableHighAccuracy: true,
      distanceFilter: 20,
      interval: 5000,
    });
    return () => Geolocation.clearWatch(watchId);
  }, []);

  const getCoords = (
    geo: any,
  ): {latitude: number; longitude: number} | null => {
    if (!geo) return null;
    const coords = geo.coordinates || geo;
    if (Array.isArray(coords) && coords.length >= 2) {
      const lng = coords[0];
      const lat = coords[1];
      if (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        isFinite(lat) &&
        isFinite(lng)
      ) {
        return {latitude: lat, longitude: lng};
      }
    }
    return null;
  };

  const pickupCoords = booking ? getCoords(booking.pickup_location) : null;
  const dropCoords = booking ? getCoords(booking.drop_location) : null;
  const destination =
    step === 'going_to_pickup' ? pickupCoords : dropCoords || pickupCoords;

  const lastFitRef = useRef(0);
  useEffect(() => {
    if (!mapRef.current || !driverLocation || !destination) return;
    const now = Date.now();
    if (now - lastFitRef.current < 5000) return;
    lastFitRef.current = now;
    mapRef.current.fitToCoordinates([driverLocation, destination], {
      edgePadding: {top: 100, right: 60, bottom: 350, left: 60},
      animated: true,
    });
  }, [driverLocation, destination]);

  const openGoogleMapsNav = () => {
    if (!destination) return;
    const url = Platform.select({
      ios: `maps://app?daddr=${destination.latitude},${destination.longitude}&dirflg=d`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`,
        );
      });
    }
  };

  const fetchActiveBooking = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDriverActiveBooking();
      if (data) {
        setBooking(data);
        if (data.status === 'ongoing') setStep('delivering');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBooking();
  }, [fetchActiveBooking]);

  useEffect(() => {
    if (step === 'delivering' && dropCoords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: dropCoords.latitude,
          longitude: dropCoords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600,
      );
    }
  }, [step, dropCoords]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current!);
          resendTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendDeliveryOtp = async () => {
    if (isResending || resendCooldown > 0 || booking?.delivery_otp_verified)
      return;
    setIsResending(true);
    try {
      const activeId = booking?.id || bookingId;
      await resendDeliveryOtp(activeId);
      startResendCooldown();
      Alert.alert(
        'OTP Sent',
        `Delivery OTP resent to ${
          booking?.receiver_phone || booking?.sender_phone || 'receiver'
        }.`,
      );
    } catch (e: any) {
      const msg: string =
        e?.response?.data?.message ?? 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsResending(false);
    }
  };

  const handlePickedUp = () => {
    if (!bookingId || starting) return;
    setPickupOtpInput('');
    setPickupOtpModalVisible(true);
  };

  const handleConfirmPickup = async () => {
    if (!bookingId || starting) return;
    if (!pickupOtpInput.trim() || pickupOtpInput.trim().length !== 6) {
      Alert.alert(
        'Enter OTP',
        'Please enter the 6-digit pickup OTP from the customer.',
      );
      return;
    }
    setStarting(true);
    const activeId = booking?.id || bookingId;
    try {
      await startTrip(activeId, pickupOtpInput.trim());
      setPickupOtpModalVisible(false);
      setStep('delivering');
    } catch (e: any) {
      Alert.alert(
        'Invalid OTP',
        e?.response?.data?.message ?? 'Could not start trip. Try again.',
      );
    } finally {
      setStarting(false);
    }
  };

  const openDeliveryModal = () => {
    setDeliveryStep('payment');
    setPaymentChoice(null);
    setOtpInput('');
    setHasToll(false);
    setTollAmountText('');
    setDeliveryModalVisible(true);
  };

  const handlePaymentNext = () => {
    if (!booking?.is_already_paid && !paymentChoice) {
      Alert.alert(
        'Select Payment',
        'Please choose a payment method before continuing.',
      );
      return;
    }
    setDeliveryStep('otp');
  };

  const handleConfirmComplete = async () => {
    if (!bookingId || completing) return;
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      Alert.alert(
        'Enter OTP',
        'Please enter the 6-digit delivery OTP from the sender.',
      );
      return;
    }
    const tollAmount = hasToll ? parseFloat(tollAmountText) : 0;
    if (hasToll && (!tollAmountText || isNaN(tollAmount) || tollAmount <= 0)) {
      Alert.alert('Enter Toll Amount', 'Please enter a valid toll amount.');
      return;
    }
    setCompleting(true);
    const activeId = booking?.id || bookingId;
    try {
      const result = await completeTrip(activeId, {
        delivery_otp: otpInput.trim(),
        payment_method: booking?.is_already_paid
          ? undefined
          : paymentChoice ?? undefined,
        has_toll: hasToll,
        toll_amount: tollAmount,
      });
      setDeliveryModalVisible(false);
      setTripResult(result);
      setSummaryVisible(true);
    } catch (e: any) {
      const msg: string =
        e?.response?.data?.message ?? 'Could not complete trip. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setCompleting(false);
    }
  };

  const openUpiApp = () => {
    if (!booking) return;
    const upiUrl = buildUpiUrl(Number(booking.estimated_fare), booking.id);
    Linking.openURL(upiUrl).catch(() =>
      Alert.alert(
        'No UPI App',
        'Ask the customer to scan the QR code or use any UPI app.',
      ),
    );
  };

  const tollAmount = hasToll ? parseFloat(tollAmountText) || 0 : 0;
  const estimatedFare = Number(booking?.estimated_fare ?? 0);
  const totalFare = estimatedFare + tollAmount;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const isAlreadyPaid = booking?.is_already_paid ?? false;
  const upiUrl = booking
    ? buildUpiUrl(Number(booking.estimated_fare), booking.id)
    : '';
  const qrImageUrl = buildQrImageUrl(upiUrl);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      {/* Map */}
      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation
          showsMyLocationButton={false}
          initialRegion={{
            latitude: driverLocation?.latitude ?? 20.2961,
            longitude: driverLocation?.longitude ?? 85.8245,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}>
          {pickupCoords && (
            <Marker
              coordinate={pickupCoords}
              title="Pickup"
              pinColor="#10B981"
            />
          )}
          {dropCoords && (
            <Marker coordinate={dropCoords} title="Drop" pinColor="#EF4444" />
          )}
        </MapView>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color="#1C1C1E"
          />
        </TouchableOpacity>
        {destination && (
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={openGoogleMapsNav}
            activeOpacity={0.8}>
            <Ionicons
              name="navigate"
              size={moderateScale(20)}
              color="#FFFFFF"
            />
            <Text style={styles.navigateBtnText}>
              {step === 'delivering'
                ? 'Navigate to Drop'
                : 'Navigate to Pickup'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <StepDot
            active={step === 'going_to_pickup'}
            done={step === 'delivering'}
            label="Pickup"
          />
          <View style={styles.stepLine} />
          <StepDot
            active={step === 'delivering'}
            done={false}
            label="Deliver"
          />
        </View>

        {/* Addresses */}
        {booking ? (
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={styles.dotGreen} />
              <View style={styles.addressTexts}>
                <Text style={styles.addressLabel}>PICKUP</Text>
                <Text style={styles.addressValue} numberOfLines={2}>
                  {booking.pickup_address}
                </Text>
              </View>
            </View>
            <View style={styles.addressDivider} />
            <View style={styles.addressRow}>
              <View style={styles.dotRed} />
              <View style={styles.addressTexts}>
                <Text style={styles.addressLabel}>DROP</Text>
                <Text style={styles.addressValue} numberOfLines={2}>
                  {booking.drop_address}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Contact cards */}
        {booking && (
          <View style={styles.contactsRow}>
            <ContactCard
              label="Sender"
              name={booking.sender_name}
              phone={booking.sender_phone}
              color="#3B82F6"
            />
            {step === 'delivering' && booking.receiver_name && (
              <ContactCard
                label="Receiver"
                name={booking.receiver_name}
                phone={booking.receiver_phone ?? booking.alternative_phone}
                color="#10B981"
              />
            )}
          </View>
        )}

        {/* Paid By badge */}
        {booking && (
          <View
            style={[
              styles.paidByBanner,
              booking.paid_by === 'receiver'
                ? styles.paidByReceiver
                : styles.paidBySender,
            ]}>
            <Ionicons
              name={
                booking.paid_by === 'receiver' ? 'person-outline' : 'person'
              }
              size={moderateScale(16)}
              color={booking.paid_by === 'receiver' ? '#7C3AED' : '#0369A1'}
            />
            <Text
              style={[
                styles.paidByText,
                {color: booking.paid_by === 'receiver' ? '#7C3AED' : '#0369A1'},
              ]}>
              {booking.paid_by === 'receiver'
                ? 'Receiver Pays — Collect at Delivery'
                : 'Sender Pays — Collect at Pickup'}
            </Text>
          </View>
        )}

        {/* Fare + payment status */}
        <View style={styles.fareRow}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>{fmt(estimatedFare)}</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Payment</Text>
            {isAlreadyPaid ? (
              <View style={styles.paidBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={moderateScale(12)}
                  color="#16A34A"
                />
                <Text style={styles.paidBadgeText}>Paid</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.fareValue,
                  {color: '#F59E0B', fontSize: moderateScale(12)},
                ]}>
                Pending
              </Text>
            )}
          </View>
        </View>

        {/* Action button */}
        {step === 'going_to_pickup' ? (
          <TouchableOpacity
            style={[styles.actionBtn, starting && styles.actionBtnDisabled]}
            onPress={handlePickedUp}
            disabled={starting}
            activeOpacity={0.8}>
            {starting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={moderateScale(20)}
                  color="#FFFFFF"
                />
                <Text style={styles.actionBtnText}>Confirm Pickup</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <SlideToConfirm
            label="Slide to Confirm Delivery"
            onSlideComplete={openDeliveryModal}
            color="#16A34A"
            icon="chevron-forward"
          />
        )}
      </View>

      {/* ── Pickup OTP Modal ──────────────────────────────────────── */}
      <Modal visible={pickupOtpModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={[
              styles.modalBox,
              {
                paddingBottom:
                  Platform.OS === 'ios'
                    ? verticalScale(44)
                    : verticalScale(24),
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Pickup</Text>
              <Text style={styles.modalSubtitle}>
                Enter the OTP shared by the customer to confirm package handover
              </Text>
            </View>
            <View style={styles.pickupOtpHintBox}>
              <Ionicons
                name="person-circle-outline"
                size={moderateScale(28)}
                color="#3B82F6"
              />
              <View style={{flex: 1}}>
                <Text style={styles.pickupOtpHintTitle}>
                  Ask customer for their Pickup OTP
                </Text>
                <Text style={styles.pickupOtpHintSub}>
                  The sender should be able to see both OTPs, and the receiver
                  should receive only the receiver's OTP via SMS.
                </Text>
              </View>
            </View>
            <Text style={styles.otpLabel}>Pickup OTP</Text>
            <OtpBoxInput
              value={pickupOtpInput}
              onChange={setPickupOtpInput}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setPickupOtpModalVisible(false)}
                activeOpacity={0.7}>
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  starting && styles.confirmBtnDisabled,
                ]}
                onPress={handleConfirmPickup}
                disabled={starting}
                activeOpacity={0.8}>
                {starting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Pickup</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Delivery Completion Modal ────────────────────────────── */}
      <Modal visible={deliveryModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalBox}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Complete Delivery</Text>
                <Text style={styles.modalSubtitle}>
                  {deliveryStep === 'payment'
                    ? 'Confirm payment before completing delivery'
                    : 'Enter the OTP shared by the sender'}
                </Text>
              </View>

              {/* ── STEP 1: PAYMENT ── */}
              {deliveryStep === 'payment' && (
                <>
                  {isAlreadyPaid ? (
                    <View style={styles.alreadyPaidBanner}>
                      <Ionicons
                        name="checkmark-circle"
                        size={moderateScale(28)}
                        color="#16A34A"
                      />
                      <View style={styles.alreadyPaidTexts}>
                        <Text style={styles.alreadyPaidTitle}>
                          Already Paid Online
                        </Text>
                        <Text style={styles.alreadyPaidSub}>
                          Customer completed payment during booking
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.paymentSelectLabel}>
                        {booking?.paid_by === 'receiver'
                          ? 'Collect payment from receiver'
                          : 'Select Payment Method'}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.paymentOption,
                          paymentChoice === 'cash' &&
                            styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentChoice('cash')}
                        activeOpacity={0.8}>
                        <View
                          style={[
                            styles.paymentOptionIcon,
                            {backgroundColor: '#F0FDF4'},
                          ]}>
                          <Image
                            source={require('../assets/cash.png')}
                            style={styles.paymentOptionIconImg}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.paymentOptionTexts}>
                          <Text style={styles.paymentOptionTitle}>
                            Cash Payment
                          </Text>
                          <Text style={styles.paymentOptionSub}>
                            Collect {fmt(estimatedFare)} from{' '}
                            {booking?.paid_by === 'receiver'
                              ? 'receiver'
                              : 'sender'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioOuter,
                            paymentChoice === 'cash' &&
                              styles.radioOuterSelected,
                          ]}>
                          {paymentChoice === 'cash' && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.paymentOption,
                          paymentChoice === 'online' &&
                            styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentChoice('online')}
                        activeOpacity={0.8}>
                        <View
                          style={[
                            styles.paymentOptionIcon,
                            {backgroundColor: '#EFF6FF'},
                          ]}>
                          <Image
                            source={require('../assets/bhim.png')}
                            style={styles.paymentOptionIconImg}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.paymentOptionTexts}>
                          <Text style={styles.paymentOptionTitle}>
                            UPI / QR Payment
                          </Text>
                          <Text style={styles.paymentOptionSub}>
                            Show QR to{' '}
                            {booking?.paid_by === 'receiver'
                              ? 'receiver'
                              : 'sender'}{' '}
                            for {fmt(estimatedFare)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioOuter,
                            paymentChoice === 'online' &&
                              styles.radioOuterSelected,
                          ]}>
                          {paymentChoice === 'online' && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                      </TouchableOpacity>
                      {paymentChoice === 'online' && (
                        <View style={styles.qrPanel}>
                          <Text style={styles.qrPanelTitle}>
                            Ask customer to scan this QR
                          </Text>
                          <View style={styles.qrImageWrap}>
                            <Image
                              source={{uri: qrImageUrl}}
                              style={styles.qrImage}
                              resizeMode="contain"
                            />
                          </View>
                          <Text style={styles.qrAmount}>
                            {fmt(estimatedFare)}
                          </Text>
                          <TouchableOpacity
                            style={styles.openUpiBtn}
                            onPress={openUpiApp}
                            activeOpacity={0.8}>
                            <Ionicons
                              name="phone-portrait-outline"
                              size={moderateScale(16)}
                              color="#3B82F6"
                            />
                            <Text style={styles.openUpiBtnText}>
                              Open UPI App
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.qrHint}>
                            Once customer confirms payment, slide to enter OTP
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                  {booking?.vehicle_type &&
                    !['bike', 'bicycle', 'scooter', 'ev_bike'].includes(
                      booking.vehicle_type.toLowerCase(),
                    ) && (
                      <>
                        <View style={styles.tollToggleRow}>
                          <View style={styles.tollToggleLeft}>
                            <View style={styles.tollIconBg}>
                              <Text style={styles.tollIconText}>🛣️</Text>
                            </View>
                            <View>
                              <Text style={styles.tollToggleTitle}>
                                Toll Charges
                              </Text>
                              <Text style={styles.tollToggleSub}>
                                Did you cross a toll booth?
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[styles.toggle, hasToll && styles.toggleOn]}
                            onPress={() => {
                              setHasToll(v => !v);
                              setTollAmountText('');
                            }}
                            activeOpacity={0.8}>
                            <View
                              style={[
                                styles.toggleThumb,
                                hasToll && styles.toggleThumbOn,
                              ]}
                            />
                          </TouchableOpacity>
                        </View>
                        {hasToll && (
                          <View style={styles.tollInputWrap}>
                            <Text style={styles.tollInputLabel}>
                              Toll Amount (₹)
                            </Text>
                            <View style={styles.tollInputRow}>
                              <Text style={styles.rupeeSign}>₹</Text>
                              <TextInput
                                style={styles.tollInput}
                                value={tollAmountText}
                                onChangeText={v =>
                                  setTollAmountText(
                                    v.replace(/[^0-9.]/g, ''),
                                  )
                                }
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>
                        )}
                      </>
                    )}
                  <View style={styles.fareBreakdown}>
                    <FareRow label="Trip Fare" value={fmt(estimatedFare)} />
                    {hasToll && tollAmount > 0 && (
                      <FareRow
                        label="Toll Charges"
                        value={fmt(tollAmount)}
                        highlight
                      />
                    )}
                    <View style={styles.fareBreakdownDivider} />
                    <FareRow label="Total" value={fmt(totalFare)} bold />
                  </View>

                  {/* ── Slide to Next ── */}
                  <View style={styles.sliderActionArea}>
                    <SlideToConfirm
                      label="Slide to Enter OTP →"
                      onSlideComplete={handlePaymentNext}
                      color="#3B82F6"
                      icon="chevron-forward"
                    />
                    <TouchableOpacity
                      style={styles.ghostBackBtn}
                      onPress={() => setDeliveryModalVisible(false)}
                      activeOpacity={0.7}>
                      <Ionicons
                        name="arrow-back"
                        size={moderateScale(14)}
                        color="#9CA3AF"
                      />
                      <Text style={styles.ghostBackBtnText}>Back</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── STEP 2: OTP ── */}
              {deliveryStep === 'otp' && (
                <>
                  <View
                    style={
                      isAlreadyPaid
                        ? styles.alreadyPaidBanner
                        : styles.paymentSummaryBadge
                    }>
                    <Ionicons
                      name={
                        isAlreadyPaid
                          ? 'checkmark-circle'
                          : paymentChoice === 'cash'
                          ? 'cash-outline'
                          : 'qr-code-outline'
                      }
                      size={moderateScale(20)}
                      color={isAlreadyPaid ? '#16A34A' : '#3B82F6'}
                    />
                    <Text
                      style={
                        isAlreadyPaid
                          ? styles.alreadyPaidTitle
                          : styles.paymentSummaryText
                      }>
                      {isAlreadyPaid
                        ? 'Already Paid Online'
                        : paymentChoice === 'cash'
                        ? `Cash: ${fmt(totalFare)}`
                        : `Online: ${fmt(totalFare)}`}
                    </Text>
                  </View>
                  <View style={styles.otpSentBox}>
                    <Ionicons
                      name="phone-portrait-outline"
                      size={moderateScale(22)}
                      color="#10B981"
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.otpSentTitle}>
                        OTP sent to receiver via SMS
                      </Text>
                      <Text style={styles.otpSentSub}>
                        {booking?.receiver_phone || booking?.sender_phone
                          ? `Sent to ${
                              booking?.receiver_phone || booking?.sender_phone
                            }`
                          : 'Receiver was sent the OTP when package was picked up'}
                      </Text>
                    </View>
                  </View>
                  {!booking?.delivery_otp_verified && (
                    <TouchableOpacity
                      style={[
                        styles.resendOtpBtn,
                        (isResending || resendCooldown > 0) &&
                          styles.resendOtpBtnDisabled,
                      ]}
                      onPress={handleResendDeliveryOtp}
                      disabled={isResending || resendCooldown > 0}
                      activeOpacity={0.8}>
                      {isResending ? (
                        <ActivityIndicator color="#10B981" size="small" />
                      ) : (
                        <Ionicons
                          name="refresh"
                          size={moderateScale(15)}
                          color={resendCooldown > 0 ? '#9CA3AF' : '#10B981'}
                        />
                      )}
                      <Text
                        style={[
                          styles.resendOtpBtnText,
                          resendCooldown > 0 && {color: '#9CA3AF'},
                        ]}>
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend OTP to Receiver'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.otpLabel}>Delivery OTP</Text>
                  <Text style={styles.otpHint}>
                    Ask the receiver to share the 6-digit OTP
                  </Text>
                  <OtpBoxInput
                    value={otpInput}
                    onChange={setOtpInput}
                    autoFocus
                  />

                  {/* ── Slide to Confirm Delivery ── */}
                  <View style={styles.sliderActionArea}>
                    <SlideToConfirm
                      label="Slide to Confirm Delivery"
                      onSlideComplete={handleConfirmComplete}
                      color="#16A34A"
                      disabled={completing}
                      loading={completing}
                      icon="checkmark"
                    />
                    <TouchableOpacity
                      style={styles.ghostBackBtn}
                      onPress={() => setDeliveryStep('payment')}
                      activeOpacity={0.7}>
                      <Ionicons
                        name="arrow-back"
                        size={moderateScale(14)}
                        color="#9CA3AF"
                      />
                      <Text style={styles.ghostBackBtnText}>Back</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Trip Summary Modal ──────────────────────────────────── */}
      <Modal visible={summaryVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="checkmark-circle"
                size={moderateScale(56)}
                color="#16A34A"
              />
            </View>
            <Text style={styles.summaryTitle}>Trip Completed!</Text>
            {tripResult && (
              <>
                <View style={styles.summaryCard}>
                  <SummaryRow
                    label="Trip Fare"
                    value={fmt(tripResult.fare_summary.estimated_fare)}
                  />
                  {tripResult.fare_summary.toll_amount > 0 && (
                    <SummaryRow
                      label="Toll"
                      value={fmt(tripResult.fare_summary.toll_amount)}
                    />
                  )}
                  {tripResult.fare_summary.waiting_charge > 0 && (
                    <SummaryRow
                      label="Waiting"
                      value={fmt(tripResult.fare_summary.waiting_charge)}
                    />
                  )}
                  <View style={styles.summaryDivider} />
                  <SummaryRow
                    label="Total"
                    value={fmt(tripResult.fare_summary.final_fare)}
                    bold
                  />
                  <View style={styles.summaryDivider} />
                  <SummaryRow
                    label="Your Earnings"
                    value={fmt(tripResult.fare_summary.driver_earnings)}
                    green
                  />
                  {(tripResult.coins_earned ?? 0) > 0 && (
                    <SummaryRow
                      label="Coins Earned"
                      value={`+${tripResult.coins_earned} 🪙`}
                    />
                  )}
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setSummaryVisible(false);
                navigation.navigate('MainTabs');
              }}
              activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <View style={styles.stepDotWrap}>
      <View
        style={[
          styles.stepDot,
          active && styles.stepDotActive,
          done && styles.stepDotDone,
        ]}>
        {done ? (
          <Ionicons name="checkmark" size={moderateScale(12)} color="#FFFFFF" />
        ) : null}
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function FareRow({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.fareBreakdownRow}>
      <Text
        style={[
          styles.fareBreakdownLabel,
          bold && {fontWeight: '700', color: '#1C1C1E'},
        ]}>
        {label}
      </Text>
      <Text
        style={[
          styles.fareBreakdownValue,
          bold && {fontWeight: '800', color: '#1C1C1E'},
          highlight && {color: '#F59E0B'},
        ]}>
        {value}
      </Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  green = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && {fontWeight: '700'}]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          bold && {fontWeight: '800', color: '#1C1C1E'},
          green && {color: '#16A34A', fontWeight: '800'},
        ]}>
        {value}
      </Text>
    </View>
  );
}

function ContactCard({
  label,
  name,
  phone,
  color,
}: {
  label: string;
  name?: string;
  phone?: string;
  color: string;
}) {
  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  return (
    <View style={[styles.contactCard, {borderLeftColor: color}]}>
      <Text style={[styles.contactLabel, {color}]}>{label}</Text>
      <Text style={styles.contactName}>{name ?? '—'}</Text>
      {phone ? (
        <TouchableOpacity style={styles.contactCallBtn} onPress={handleCall}>
          <Text style={styles.contactCallText}>📞 {phone}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F0F4FF'},
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  // Map
  mapArea: {flex: 1, backgroundColor: '#E8EFF8'},
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    left: scale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navigateBtn: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(18),
    borderRadius: moderateScale(14),
    gap: scale(6),
    elevation: 6,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  navigateBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Bottom sheet
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(40) : verticalScale(24),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  handle: {
    width: moderateScale(40),
    height: verticalScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  // Step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(20),
  },
  stepDotWrap: {alignItems: 'center'},
  stepDot: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  stepDotActive: {backgroundColor: '#3B82F6'},
  stepDotDone: {backgroundColor: '#16A34A'},
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: scale(8),
  },
  stepLabel: {fontSize: moderateScale(11), color: '#9CA3AF', fontWeight: '600'},
  stepLabelActive: {color: '#3B82F6'},
  // Address card
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addressRow: {flexDirection: 'row', alignItems: 'flex-start'},
  dotGreen: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#34C759',
    marginTop: verticalScale(4),
    marginRight: scale(10),
  },
  dotRed: {
    width: moderateScale(10),
    height: moderateScale(10),
    backgroundColor: '#FF3B30',
    borderRadius: moderateScale(2),
    marginTop: verticalScale(4),
    marginRight: scale(10),
  },
  addressTexts: {flex: 1},
  addressLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addressValue: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 2,
  },
  addressDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(10),
    marginLeft: scale(20),
  },
  // Fare row
  fareRow: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(12),
    padding: scale(14),
    marginBottom: verticalScale(14),
  },
  fareItem: {flex: 1, alignItems: 'center'},
  fareDivider: {width: 1, backgroundColor: '#BFDBFE'},
  fareLabel: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  fareValue: {fontSize: moderateScale(16), fontWeight: '800', color: '#1E40AF'},
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginTop: 2,
  },
  paidBadgeText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#16A34A',
  },
  // Paid by banner
  paidByBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(4),
  },
  paidBySender: {backgroundColor: '#E0F2FE'},
  paidByReceiver: {backgroundColor: '#EDE9FE'},
  paidByText: {fontSize: moderateScale(12), fontWeight: '700'},
  // Action button
  actionBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionBtnGreen: {backgroundColor: '#16A34A', shadowColor: '#16A34A'},
  actionBtnDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
    shadowOpacity: 0,
  },
  actionBtnText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Modal box
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: scale(24),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(44) : verticalScale(24),
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  modalHeader: {marginBottom: verticalScale(20)},
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  modalSubtitle: {fontSize: moderateScale(13), color: '#6B7280'},
  // Pickup OTP hint
  pickupOtpHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(14),
    padding: scale(14),
    gap: scale(12),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pickupOtpHintTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1E40AF',
  },
  pickupOtpHintSub: {
    fontSize: moderateScale(12),
    color: '#3B82F6',
    marginTop: 2,
  },
  // Already paid
  alreadyPaidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: moderateScale(14),
    padding: scale(14),
    gap: scale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  alreadyPaidTexts: {flex: 1},
  alreadyPaidTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#15803D',
  },
  alreadyPaidSub: {fontSize: moderateScale(12), color: '#4ADE80', marginTop: 2},
  // Payment options
  paymentSelectLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(10),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(10),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: scale(12),
  },
  paymentOptionSelected: {backgroundColor: '#EFF6FF', borderColor: '#3B82F6'},
  paymentOptionIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  paymentOptionIconImg: {
    width: moderateScale(28),
    height: moderateScale(28),
  },
  paymentOptionTexts: {flex: 1},
  paymentOptionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1C1C1E',
  },
  paymentOptionSub: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: 2,
  },
  radioOuter: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {borderColor: '#3B82F6'},
  radioDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#3B82F6',
  },
  // QR panel
  qrPanel: {
    backgroundColor: '#F8FAFF',
    borderRadius: moderateScale(16),
    padding: scale(16),
    alignItems: 'center',
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  qrPanelTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: verticalScale(12),
  },
  qrImageWrap: {
    width: moderateScale(220),
    height: moderateScale(220),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    overflow: 'hidden',
  },
  qrImage: {width: moderateScale(200), height: moderateScale(200)},
  qrAmount: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#1E40AF',
    marginTop: verticalScale(12),
  },
  openUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(10),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  openUpiBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#3B82F6',
  },
  qrHint: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  // Payment summary badge (OTP step)
  paymentSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(10),
    padding: scale(12),
    marginBottom: verticalScale(16),
  },
  paymentSummaryText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#1E40AF',
  },
  // OTP label / hint
  otpLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
  },
  otpHint: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginBottom: verticalScale(12),
  },
  // Toll toggle
  tollToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tollToggleLeft: {flexDirection: 'row', alignItems: 'center', gap: scale(12)},
  tollIconBg: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tollIconText: {fontSize: moderateScale(20)},
  tollToggleTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1C1C1E',
  },
  tollToggleSub: {fontSize: moderateScale(12), color: '#6B7280'},
  toggle: {
    width: moderateScale(50),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: moderateScale(3),
  },
  toggleOn: {backgroundColor: '#3B82F6'},
  toggleThumb: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleThumbOn: {transform: [{translateX: moderateScale(22)}]},
  // Toll input
  tollInputWrap: {marginBottom: verticalScale(12)},
  tollInputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  tollInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
  },
  rupeeSign: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#374151',
    marginRight: scale(4),
  },
  tollInput: {
    flex: 1,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1C1C1E',
    paddingVertical: verticalScale(12),
  },
  // Fare breakdown
  fareBreakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    padding: scale(14),
    marginBottom: verticalScale(16),
  },
  fareBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
  },
  fareBreakdownLabel: {fontSize: moderateScale(13), color: '#6B7280'},
  fareBreakdownValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  fareBreakdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(4),
  },
  // Modal buttons
  modalBtns: {flexDirection: 'row', gap: scale(12)},
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(6),
    elevation: 3,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Slider action area (replaces modalBtns for slider flows)
  sliderActionArea: {
    gap: verticalScale(10),
    marginBottom: verticalScale(4),
  },
  ghostBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingVertical: verticalScale(8),
  },
  ghostBackBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  // Trip summary
  summaryBox: {
    backgroundColor: '#FFFFFF',
    margin: scale(24),
    borderRadius: moderateScale(24),
    padding: scale(24),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  summaryIcon: {marginBottom: verticalScale(12)},
  summaryTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(16),
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(7),
  },
  summaryLabel: {fontSize: moderateScale(13), color: '#6B7280'},
  summaryValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(4),
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  doneBtnText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Contact cards
  contactsRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(10),
  },
  contactCard: {
    flex: 1,
    borderRadius: moderateScale(12),
    padding: scale(10),
    borderWidth: 1.5,
  },
  contactLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: verticalScale(3),
  },
  contactName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(6),
  },
  contactCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
  },
  contactCallText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // OTP sent info box
  otpSentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
    backgroundColor: '#F0FDF4',
    borderRadius: moderateScale(12),
    padding: scale(12),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  otpSentTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 2,
  },
  otpSentSub: {fontSize: moderateScale(11), color: '#4ADE80'},
  // Resend button
  resendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    alignSelf: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: verticalScale(16),
  },
  resendOtpBtnDisabled: {borderColor: '#D1D5DB'},
  resendOtpBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#10B981',
  },
});