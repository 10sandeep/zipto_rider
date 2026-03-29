import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ImageStyle,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useOnboardingStore, ApiVehicleType} from '../store/onboardingStore';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 414;

// ─── Vehicle options (UI → API mapping) ──────────────────────
const VEHICLE_TYPE_MAP: Record<string, ApiVehicleType> = {
  bike: 'bike',
  auto: 'pickup_van',
  pickup: 'pickup_van',
  truck: 'mini_truck',
};

const vehicles = [
  {
    id: 'bike',
    name: 'Bike',
    image: require('../assets/bike_img.png'),
    capacity: 'Up to 8kg',
    defaultCapacity: '20',
    icon: '🏍️',
    tag: 'Express',
  },
  {
    id: 'scooter',
    name: 'Scooter',
    image: require('../assets/scooter_img.png'),
    capacity: 'Up to 10kg',
    defaultCapacity: '10',
    icon: '🛵',
    tag: 'City',
  },
  {
    id: 'auto',
    name: 'Auto',
    image: require('../assets/auto_img.png'),
    capacity: 'Up to 50kg',
    defaultCapacity: '50',
    icon: '🛺',
    tag: 'Standard',
  },
  {
    id: 'pickup',
    name: 'Pick Up',
    image: require('../assets/pickup_img.png'),
    capacity: 'Up to 500kg',
    defaultCapacity: '500',
    icon: '🚐',
    tag: 'Large',
  },
  {
    id: 'truck',
    name: 'Truck',
    image: require('../assets/truck_img.png'),
    capacity: 'Up to 5000kg',
    defaultCapacity: '5000',
    icon: '🚛',
    tag: 'Heavy',
  },
];

const CARD_WIDTH = (SCREEN_WIDTH - scale(52)) / 2;

export default function VehicleSelectionScreen({navigation}: any) {
  const setVehicle = useOnboardingStore(s => s.setVehicle);

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scaleAnim = useRef<Record<string, Animated.Value>>({}).current;
  vehicles.forEach(v => {
    if (!scaleAnim[v.id]) scaleAnim[v.id] = new Animated.Value(1);
  });

  const onSelectVehicle = (id: string) => {
    // Animate card press
    Animated.sequence([
      Animated.timing(scaleAnim[id], {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim[id], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedVehicle(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setVehicleCapacity(vehicle.defaultCapacity);
    }
  };

  const isFormValid =
    selectedVehicle &&
    vehicleModel.trim().length > 0 &&
    registrationNumber.trim().length > 0 &&
    vehicleCapacity.trim().length > 0;

  const handleContinue = () => {
    if (!selectedVehicle || !isFormValid) return;
    const apiType = VEHICLE_TYPE_MAP[selectedVehicle] ?? 'bike';
    setVehicle({
      vehicleType: apiType,
      vehicleModel: vehicleModel.trim(),
      vehicleCapacity: vehicleCapacity.trim(),
      vehicleRegistrationNumber: registrationNumber.trim(),
    });
    navigation.navigate('DocumentUpload');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

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
            color="#2563EB"
          />
        </TouchableOpacity>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Step 1 of 4</Text>
            <Text style={styles.progressPercent}>25%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Title Block */}
          <View style={styles.titleBlock}>
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>Vehicle Setup</Text>
            </View>
            <Text style={styles.title}>Select Your{'\n'}Vehicle Type</Text>
            <Text style={styles.subtitle}>
              Choose the vehicle you'll use for deliveries
            </Text>
          </View>

          {/* Vehicle Cards Grid */}
          <View style={styles.vehicleGrid}>
            {vehicles.map(vehicle => (
              <Animated.View
                key={vehicle.id}
                style={{transform: [{scale: scaleAnim[vehicle.id]}]}}>
                <TouchableOpacity
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle.id && styles.selectedCard,
                  ]}
                  onPress={() => onSelectVehicle(vehicle.id)}
                  activeOpacity={0.9}>

                  {/* Tag */}
                  <View
                    style={[
                      styles.vehicleTag,
                      selectedVehicle === vehicle.id && styles.vehicleTagSelected,
                    ]}>
                    <Text
                      style={[
                        styles.vehicleTagText,
                        selectedVehicle === vehicle.id &&
                          styles.vehicleTagTextSelected,
                      ]}>
                      {vehicle.tag}
                    </Text>
                  </View>

                  {/* Image */}
                  <View style={styles.vehicleImageContainer}>
                    <Image
                      source={vehicle.image}
                      style={styles.vehicleImage as ImageStyle}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    style={[
                      styles.vehicleName,
                      selectedVehicle === vehicle.id && styles.vehicleNameSelected,
                    ]}>
                    {vehicle.name}
                  </Text>
                  <Text style={styles.capacityText}>{vehicle.capacity}</Text>

                  {/* Checkmark */}
                  {selectedVehicle === vehicle.id && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark"
                        size={moderateScale(13)}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Vehicle Details — shown after selection */}
          {selectedVehicle && (
            <View style={styles.detailsSection}>
              <View style={styles.detailsHeader}>
                <View style={styles.detailsDot} />
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vehicle Model</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'model' && styles.inputWrapperFocused,
                  ]}>
                  <Ionicons
                    name="car-outline"
                    size={moderateScale(18)}
                    color={focusedField === 'model' ? '#2563EB' : '#9CA3AF'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Honda Activa, Tata Ace"
                    placeholderTextColor="#C4C9D4"
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                    onFocus={() => setFocusedField('model')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registration Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'reg' && styles.inputWrapperFocused,
                  ]}>
                  <Ionicons
                    name="document-text-outline"
                    size={moderateScale(18)}
                    color={focusedField === 'reg' ? '#2563EB' : '#9CA3AF'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. OD-02-A-1234"
                    placeholderTextColor="#C4C9D4"
                    value={registrationNumber}
                    onChangeText={setRegistrationNumber}
                    autoCapitalize="characters"
                    onFocus={() => setFocusedField('reg')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vehicle Capacity</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'cap' && styles.inputWrapperFocused,
                  ]}>
                  <Ionicons
                    name="barbell-outline"
                    size={moderateScale(18)}
                    color={focusedField === 'cap' ? '#2563EB' : '#9CA3AF'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 100"
                    placeholderTextColor="#C4C9D4"
                    value={vehicleCapacity}
                    onChangeText={setVehicleCapacity}
                    keyboardType="numeric"
                    onFocus={() => setFocusedField('cap')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <View style={styles.inputSuffix}>
                    <Text style={styles.inputSuffixText}>kg</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="layers-outline"
                size={moderateScale(18)}
                color="#2563EB"
              />
            </View>
            <Text style={styles.infoText}>
              You can add multiple vehicles later from your profile settings
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
          activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continue</Text>
          <View
            style={[
              styles.buttonArrow,
              !isFormValid && styles.buttonArrowDisabled,
            ]}>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color={isFormValid ? '#2563EB' : '#BFDBFE'}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },

  // ─── Header ──────────────────────────────────────────────────
  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(54) : verticalScale(40),
    paddingBottom: verticalScale(16),
    backgroundColor: '#F8F9FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
  },
  backButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(13),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    color: '#6B7280',
    fontWeight: '500',
    fontFamily:'Poppins-Regular',
    letterSpacing: 0.3,
  },
  progressPercent: {
    fontSize: moderateScale(12),
    fontFamily:'Poppins-Regular',
    color: '#2563EB',
    fontWeight: '700',
  },
  progressTrack: {
    height: verticalScale(5),
    backgroundColor: '#E0E7FF',
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: moderateScale(10),
  },

  // ─── Scroll Content ───────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(120),
  },

  // ─── Title Block ──────────────────────────────────────────────
  titleBlock: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(28),
  },
  titleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  titleBadgeText: {
    fontSize: moderateScale(11),
    color: '#4F46E5',
    fontWeight: '700',
    fontFamily:'Poppins-Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 26 : isLargeDevice ? 32 : 28),
    fontWeight: '800',
    fontFamily:'Poppins-Regular',
    color: '#111827',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(isSmallDevice ? 33 : isLargeDevice ? 40 : 36),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    fontFamily:'Poppins-Regular',
    lineHeight: moderateScale(20),
    fontWeight: '400',
  },

  // ─── Vehicle Grid ─────────────────────────────────────────────
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
    gap: verticalScale(0),
  },
  vehicleCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    padding: scale(14),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    marginBottom: verticalScale(14),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minHeight: verticalScale(160),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  vehicleTag: {
    position: 'absolute',
    top: scale(10),
    left: scale(10),
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(2),
  },
  vehicleTagSelected: {
    backgroundColor: '#DBEAFE',
  },
  vehicleTagText: {
    fontSize: moderateScale(9),
    color: '#9CA3AF',
    fontWeight: '700',
    fontFamily:'Poppins-Regular',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  vehicleTagTextSelected: {
    color: '#2563EB',
  },
  vehicleImageContainer: {
    height: verticalScale(72),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  vehicleImage: {
    width: moderateScale(64),
    height: moderateScale(64),
  },
  vehicleName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    fontFamily:'Poppins-Regular',
    color: '#374151',
    marginBottom: verticalScale(3),
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  vehicleNameSelected: {
    color: '#1D4ED8',
  },
  capacityText: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    fontFamily:'Poppins-Regular',
    textAlign: 'center',
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 4,
  },

  // ─── Vehicle Details Section ──────────────────────────────────
  detailsSection: {
    marginBottom: verticalScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: scale(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#2563EB',
    borderRadius: moderateScale(3),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    fontFamily:'Poppins-Regular',
    color: '#111827',
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: verticalScale(14),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    fontFamily:'Poppins-Regular',
    color: '#374151',
    marginBottom: verticalScale(7),
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(13),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(14),
    minHeight: verticalScale(52),
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#EEF2FF',
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    fontFamily:'Poppins-Regular',
    color: '#111827',
    paddingVertical: verticalScale(12),
    fontWeight: '500',
  },
  inputSuffix: {
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(7),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  inputSuffixText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    fontFamily:'Poppins-Regular',
    color: '#6B7280',
  },

  // ─── Info Box ─────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: scale(16),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
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
    fontFamily:'Poppins-Regular',
    color: '#3730A3',
    lineHeight: moderateScale(19),
    fontWeight: '500',
  },

  // ─── Footer ───────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(14),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(36) : verticalScale(22),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  continueButton: {
    backgroundColor: '#2563EB',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(56),
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#BFDBFE',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
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