import React, { useEffect, useRef, useState } from 'react';
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
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const images = [
  require('../assets/onboarding1.png'),
  require('../assets/onboarding2.png'),
  require('../assets/onboarding3.png'),
];

export default function WelcomeScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const handleRegister = () => navigation.navigate('Register');
  const handleLogin = () => navigation.navigate('Login');

  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <ImageBackground
      source={item}
      style={styles.backgroundImage}
      resizeMode="contain"
      imageStyle={styles.backgroundImageStyle}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Images only scroll here ─────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Gradient overlay on top of images */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.2)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.92)',
            '#000000',
          ]}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
      </View>

      {/* ── Bottom section stays fixed ──────────────────────────────── */}
      <View style={styles.bottomOverlay}>
        <View style={styles.buttonContainer}>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // ── Image area ────────────────────────────────────────────────────────────
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.78,
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.78,
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
  },

  // ── Bottom fixed section ──────────────────────────────────────────────────
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(20),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
  },
  buttonContainer: {
    gap: verticalScale(10),
  },

  // ── Pagination Dots ───────────────────────────────────────────────────────
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: scale(4),
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: moderateScale(24),
  },

  // ── Create Account button ─────────────────────────────────────────────────
  registerButton: {
    borderRadius: moderateScale(12),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: verticalScale(13),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(46),
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Login button ──────────────────────────────────────────────────────────
  loginButton: {
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonInner: {
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: verticalScale(46),
  },
  loginButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Terms ─────────────────────────────────────────────────────────────────
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: moderateScale(12),
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginTop: verticalScale(4),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: '#93C5FD',
    fontWeight: '600',
  },
});