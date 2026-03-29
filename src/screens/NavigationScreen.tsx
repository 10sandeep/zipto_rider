import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function NavigationScreen({route, navigation}: any) {
  const {orderId} = route.params;
  const [eta, setEta] = useState('15 min');
  const [distance, setDistance] = useState('3.2 km');
  const [step, setStep] = useState<'pickup' | 'delivery'>('pickup');

  const handleComplete = () => {
    if (step === 'pickup') {
      setStep('delivery');
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.mapPlaceholder}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>

        <Text style={styles.mapText}>🗺️ Map View</Text>
        <Text style={styles.mapSubtext}>
          Navigation interface would go here
        </Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <View style={styles.statusCard}>
          <Text style={styles.stepLabel}>
            {step === 'pickup' ? 'Going to Pickup' : 'Delivering to Customer'}
          </Text>
          <View style={styles.etaContainer}>
            <View style={styles.etaItem}>
              <Text style={styles.etaValue}>{eta}</Text>
              <Text style={styles.etaLabel}>ETA</Text>
            </View>
            <View style={styles.etaDivider} />
            <View style={styles.etaItem}>
              <Text style={styles.etaValue}>{distance}</Text>
              <Text style={styles.etaLabel}>Distance</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.callButton}
            activeOpacity={0.7}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            activeOpacity={0.8}>
            <Text style={styles.completeButtonText}>
              {step === 'pickup' ? 'Picked Up' : 'Mark as Delivered'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>Other Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#000'
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    left: scale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapText: {
    fontSize: moderateScale(isSmallDevice ? 40 : 48),
    fontFamily: 'Poppins-Regular',
  },
  mapSubtext: {
    fontSize: moderateScale(14), 
    color: '#666', 
    fontFamily: 'Poppins-Regular',
    marginTop: verticalScale(8)
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(30),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: moderateScale(40),
    height: verticalScale(4),
    backgroundColor: '#E0E0E0',
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  statusCard: {
    marginBottom: verticalScale(20)
  },
  stepLabel: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    marginBottom: verticalScale(16),
  },
  etaContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: scale(16),
    borderRadius: moderateScale(12),
  },
  etaItem: {
    flex: 1, 
    alignItems: 'center'
  },
  etaDivider: {
    width: 1, 
    backgroundColor: '#E0E0E0'
  },
  etaValue: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: '#007AFF',
    marginBottom: verticalScale(4),
  },
  etaLabel: {
    fontSize: moderateScale(13), 
    color: '#666'
  },
  actions: {
    flexDirection: 'row', 
    gap: scale(12), 
    marginBottom: verticalScale(16)
  },
  callButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  callIcon: {
    fontSize: moderateScale(28)
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(60),
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF', 
    fontSize: moderateScale(16), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  navigationButtons: {
    flexDirection: 'row', 
    gap: scale(12)
  },
  navButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(48),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: '#1C1C1E'
  },
});