import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ImageStyle,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

const vehicles = [
  {
    id: 'bike',
    name: 'Bike',
    image: require('../assets/vehicle2.png'), // Replace with your image path
    capacity: 'Up to 20kg',
  },
  {
    id: 'auto',
    name: 'Auto',
    image: require('../assets/vehicle1.png'), // Replace with your image path
    capacity: 'Up to 50kg',
  },
  {
    id: 'pickup',
    name: 'Pick Up',
    image: require('../assets/vehicle3.png'), // Replace with your image path
    capacity: 'Up to 500kg',
  },
  {
    id: 'truck',
    name: 'Truck',
    image: require('../assets/vehicle4.png'), // Replace with your image path
    capacity: 'Up to 5000kg',
  },
];

export default function VehicleSelectionScreen({navigation}: any) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedVehicle) {
      navigation.navigate('DocumentUpload', {vehicleType: selectedVehicle});
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#3B82F6"
          />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Select Your Vehicle</Text>
        <Text style={styles.subtitle}>
          Choose the vehicle you'll use for deliveries
        </Text>

        {/* Vehicle Cards */}
        <View style={styles.vehicleGrid}>
          {vehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                selectedVehicle === vehicle.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedVehicle(vehicle.id)}
              activeOpacity={0.7}>
              <View style={styles.vehicleImageContainer}>
                <Image
                  source={vehicle.image}
                  style={styles.vehicleImage as ImageStyle}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.capacityText}>{vehicle.capacity}</Text>

              {selectedVehicle === vehicle.id && (
                <View style={styles.checkmark}>
                  <Ionicons
                    name="checkmark"
                    size={moderateScale(18)}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={moderateScale(22)}
            color="#3B82F6"
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            You can add multiple vehicles later from your profile
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedVehicle && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedVehicle}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  progressBar: {
    height: verticalScale(4),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(2),
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(2),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100),
  },
  title: {
    fontSize: moderateScale(isSmallDevice ? 24 : 28),
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(20),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#8E8E93',
    marginBottom: verticalScale(30),
    lineHeight: moderateScale(22),
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  vehicleCard: {
    width: (SCREEN_WIDTH - scale(52)) / 2,
    backgroundColor: '#F5F5F5',
    padding: scale(20),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    marginBottom: verticalScale(16),
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: verticalScale(180),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  vehicleImageContainer: {
    height: verticalScale(80),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  vehicleImage: {
    width: moderateScale(70),
    height: moderateScale(70),
  },
  vehicleName: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  capacityText: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: scale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: scale(10),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#3B82F6',
    lineHeight: moderateScale(18),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(25),
    paddingTop: verticalScale(16),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(36) : verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(54),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
