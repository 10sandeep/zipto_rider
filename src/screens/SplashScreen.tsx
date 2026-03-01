import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useAuthStore} from '../store/authStore';
import {
  getVerificationStatus,
  getDriverProfile,
  getMyVehicles,
} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;

const getErrorStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'response' in error) {
    const maybeResponse = (error as {response?: {status?: number}}).response;
    return maybeResponse?.status;
  }
  return undefined;
};

const hasOnboardingData = async () => {
  try {
    const profile = await getDriverProfile();
    const vehicles = await getMyVehicles();

    const hasRequiredProfileData = Boolean(
      profile?.name?.trim() &&
        profile?.email?.trim() &&
        profile?.address?.trim(),
    );
    const hasVehicle = Array.isArray(vehicles) && vehicles.length > 0;

    return hasRequiredProfileData && hasVehicle;
  } catch (error) {
    console.log(
      '[SplashScreen] Failed to determine onboarding completeness:',
      error,
    );
    return false;
  }
};

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  /** LOGO ANIMATIONS **/
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  /** BACKGROUND FADE **/
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  /** RIDER TEXT ANIMATION **/
  const riderOpacity = useRef(new Animated.Value(0)).current;
  const riderTranslateY = useRef(new Animated.Value(20)).current;

  /** TAGLINE ANIMATION **/
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;

  /** ROUTING LOGIC **/
  const {
    token,
    isAuthenticated,
    isHydrated,
    profile,
    onboardingSubmitted,
    setProfile,
    setOnboardingSubmitted,
  } = useAuthStore();
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  const [isAnimComplete, setIsAnimComplete] = useState(false);

  useEffect(() => {
    console.log(
      '[SplashScreen] Auth State -> isHydrated:',
      isHydrated,
      '| isAuthenticated:',
      isAuthenticated,
    );

    if (!isHydrated) {
      console.log('[SplashScreen] Still hydrating... waiting.');
      return;
    }

    const hasJwt = Boolean(token);
    if (!isAuthenticated && !hasJwt) {
      console.log('[SplashScreen] Not authenticated, routing to Onboarding');
      setNextRoute('Onboarding');
      return;
    }

    console.log('\n=============================================');
    console.log(
      '[SplashScreen] 🔥 CACHED ACCESS_TOKEN 🔥 ->',
      useAuthStore.getState().token,
    );
    console.log('=============================================\n');

    const checkStatus = async () => {
      console.log('[SplashScreen] START checkStatus');
      const cachedProfile = useAuthStore.getState().profile ?? profile;
      const hasCachedOnboardingData = Boolean(
        cachedProfile?.name?.trim() &&
          cachedProfile?.email?.trim() &&
          cachedProfile?.address?.trim(),
      );

      // Safety timeout: if API doesn't respond in 3 seconds, force navigation
      let isResolved = false;
      const timeoutFallback = setTimeout(() => {
        if (!isResolved) {
          console.log(
            '[SplashScreen] API TIMEOUT - forcing fallback navigation',
          );
          if (cachedProfile?.verification_status === 'APPROVED') {
            setNextRoute('MainTabs');
          } else if (
            cachedProfile?.verification_status &&
            (onboardingSubmitted || hasCachedOnboardingData)
          ) {
            setNextRoute('KYCStatus');
          } else {
            setNextRoute('KYCVehicleRegistration');
          }
        }
      }, 3000);

      try {
        console.log('[SplashScreen] Calling getVerificationStatus()...');
        const status = await getVerificationStatus();
        isResolved = true;
        clearTimeout(timeoutFallback);
        console.log('[SplashScreen] getVerificationStatus resolved:', status);

        if (status.verification_status === 'APPROVED') {
          // Pre-fetch profile if approved
          console.log('[SplashScreen] Fetching driver profile...');
          getDriverProfile()
            .then(p => {
              console.log('[SplashScreen] Driver profile fetched successfully');
              setProfile(p);
            })
            .catch(e =>
              console.log(
                '[SplashScreen] Failed to fetch profile behind scenes',
                e,
              ),
            );

          setNextRoute('MainTabs');
        } else {
          const isAdminPending =
            status.verification_status === 'PENDING' &&
            typeof status.message === 'string' &&
            status.message.toLowerCase().includes('pending admin verification');

          if (isAdminPending) {
            setOnboardingSubmitted(true);
            setNextRoute('KYCStatus');
            return;
          }

          if (onboardingSubmitted) {
            setNextRoute('KYCStatus');
            return;
          }

          const completedOnboarding = await hasOnboardingData();
          if (completedOnboarding) {
            setOnboardingSubmitted(true);
          }
          setNextRoute(
            completedOnboarding ? 'KYCStatus' : 'KYCVehicleRegistration',
          );
        }
      } catch (error) {
        isResolved = true;
        clearTimeout(timeoutFallback);
        console.log('[SplashScreen] getVerificationStatus ERROR:', error);
        const statusCode = getErrorStatusCode(error);

        // 404 means profile does not exist yet -> start onboarding flow.
        if (statusCode === 404) {
          setNextRoute('KYCVehicleRegistration');
          return;
        }

        // Fallback to cached profile if offline or other error
        if (cachedProfile?.verification_status === 'APPROVED') {
          setNextRoute('MainTabs');
        } else if (
          cachedProfile?.verification_status &&
          (onboardingSubmitted || hasCachedOnboardingData)
        ) {
          setNextRoute('KYCStatus');
        } else {
          setNextRoute('KYCVehicleRegistration');
        }
      }
    };
    checkStatus();
  }, [
    isHydrated,
    isAuthenticated,
    token,
    setProfile,
    setOnboardingSubmitted,
    onboardingSubmitted,
    profile,
  ]);

  useEffect(() => {
    // If we've calculated the next route and the animation has also completed, execute navigation
    if (nextRoute && isAnimComplete) {
      console.log('[SplashScreen] Navigating to', nextRoute);
      navigation.replace(nextRoute);
    }
  }, [nextRoute, isAnimComplete, navigation]);

  useEffect(() => {
    Animated.sequence([
      // Fade in background
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Logo animation (scale + fade)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Rider text appears
      Animated.parallel([
        Animated.timing(riderOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(riderTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Tagline appears
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Hold for a moment
      Animated.delay(1500),

      // Fade out all elements
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(riderOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      console.log('[SplashScreen] Animation complete');
      setIsAnimComplete(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Background Gradient */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {opacity: backgroundOpacity}]}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{scale: logoScale}],
            },
          ]}>
          <Image
            source={require('../assets/logo_zipto.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Rider Text */}
        <Animated.Text
          style={[
            styles.riderText,
            {
              opacity: riderOpacity,
              transform: [{translateY: riderTranslateY}],
            },
          ]}>
          Rider
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{translateY: taglineTranslateY}],
            },
          ]}>
          Deliver with Speed, Earn with Pride
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoImage: {
    width: moderateScale(isSmallDevice ? 200 : 240),
    height: moderateScale(isSmallDevice ? 200 : 240),
  },
  riderText: {
    fontSize: moderateScale(isSmallDevice ? 40 : 48),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
    marginBottom: verticalScale(30),
  },
  tagline: {
    fontSize: moderateScale(isSmallDevice ? 14 : 16),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: scale(30),
    lineHeight: moderateScale(22),
  },
});

export default SplashScreen;
