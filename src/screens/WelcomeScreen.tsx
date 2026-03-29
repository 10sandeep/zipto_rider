import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const isSmallDevice = SCREEN_WIDTH < 375;

export default function WelcomeScreen({ navigation }: any) {
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Image */}
      <ImageBackground
        source={require('../assets/welcome.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.content}>
          {/* Empty Space */}
          <View style={styles.emptySpace} />

          {/* Bottom Overlay with Gradient — starts lower so image text is visible */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(0, 0, 0, 0.6)',
              'rgba(0, 0, 0, 0.92)',
              '#000000',
            ]}
            style={styles.bottomOverlay}
          >
            {/* Button Section */}
            <View style={styles.buttonContainer}>
              {/* Create Account */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.loginButtonInner}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  emptySpace: {
    flex: 1,
  },
  bottomOverlay: {
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(80),      // increased so gradient starts higher, giving image text room
    paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
  },
  buttonContainer: {
    gap: verticalScale(10),             // was 16 — tighter gap between buttons
  },

  // ── Create Account button (smaller) ─────────────────────────────────────
  registerButton: {
    borderRadius: moderateScale(12),    // was 15
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: verticalScale(13), // was 18
    borderRadius: moderateScale(12),    // was 15
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(46),       // was 54
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),        // was 18
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Login button (smaller) ───────────────────────────────────────────────
  loginButton: {
    borderRadius: moderateScale(12),    // was 15
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,                   // was 2
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonInner: {
    paddingVertical: verticalScale(13), // was 18
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: verticalScale(46),       // was 54
  },
  loginButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    fontSize: moderateScale(16),        // was 18
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Terms ────────────────────────────────────────────────────────────────
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: moderateScale(12),        // was 13
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginTop: verticalScale(4),        // was 8
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: '#93C5FD',
    fontWeight: '600',
  },
});