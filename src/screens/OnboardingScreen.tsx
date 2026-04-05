import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAuthStore} from '../store/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function OnboardingScreen({ navigation }: any) {
  const setHasSeenOnboarding = useAuthStore(s => s.setHasSeenOnboarding);

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../assets/welcome.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.1)',
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 0, 0, 0.75)',
            'rgba(0, 0, 0, 0.95)',
          ]}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    height: SCREEN_HEIGHT * 0.78,
    top: 0,
    width: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(30),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(30),
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(54),
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontFamily: 'poppins-regular',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});