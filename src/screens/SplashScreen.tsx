import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  PixelRatio,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import {
  getVerificationStatus,
  getDriverProfile,
  getMyVehicles,
} from '../services/driverService';

// ─── Responsive helpers ────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH  = 390;
const BASE_HEIGHT = 844;
const scaleW = (size: number) => (SCREEN_WIDTH  / BASE_WIDTH)  * size;
const scaleH = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const ms     = (size: number, factor = 0.45) => size + (scaleW(size) - size) * factor;
const fs     = (size: number) => Math.round(PixelRatio.roundToNearestPixel(ms(size)));
// ──────────────────────────────────────────────────────────────────────────────

// ─── Routing helpers ───────────────────────────────────────────────────────────
const getErrorStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'response' in error) {
    const maybeResponse = (error as { response?: { status?: number } }).response;
    return maybeResponse?.status;
  }
  return undefined;
};

const hasOnboardingData = async (): Promise<boolean> => {
  try {
    const profile  = await getDriverProfile();
    const vehicles = await getMyVehicles();
    const hasRequiredProfileData = Boolean(
      profile?.name?.trim() &&
      profile?.email?.trim() &&
      profile?.address?.trim(),
    );
    const hasVehicle = Array.isArray(vehicles) && vehicles.length > 0;
    return hasRequiredProfileData && hasVehicle;
  } catch {
    return false;
  }
};
// ──────────────────────────────────────────────────────────────────────────────

const STAGGER_MS = 100;

const ZIPTO_LETTERS      = ['Z', 'i', 'p', 't', 'o'];
const RIDER_LETTERS      = ['R', 'i', 'd', 'e', 'r'];
const ONBOARDING_LETTERS = ['O', 'n', 'b', 'o', 'a', 'r', 'd', 'i', 'n', 'g'];

// ── Stagger timeline ───────────────────────────────────────────────────────────
// Zipto pops first, then Rider+Onboarding animate as one tight block
const ZIPTO_START      = 0;
const RIDER_START      = ZIPTO_LETTERS.length * STAGGER_MS + 280;
const ONBOARDING_START = RIDER_START + RIDER_LETTERS.length * STAGGER_MS + 80; // tight 80ms gap
const POWERED_DELAY    = ONBOARDING_START + ONBOARDING_LETTERS.length * STAGGER_MS + 380;

// ── Single letter with Zomato-style pop animation ─────────────────────────────
const LetterPop = ({
  char,
  delay,
  style,
}: {
  char: string;
  delay: number;
  style?: object;
}) => {
  const scale   = useRef(new Animated.Value(0.15)).current;
  const rotate  = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
        delay,
      }),
      Animated.timing(rotate, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
        delay,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
        delay,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay]);

  const rotateInterpolate = rotate.interpolate({
    inputRange:  [-20, 0],
    outputRange: ['-20deg', '0deg'],
  });

  return (
    <Animated.Text
      style={[
        style,
        { opacity, transform: [{ scale }, { rotate: rotateInterpolate }] },
      ]}
    >
      {char}
    </Animated.Text>
  );
};

// ── Splash screen ──────────────────────────────────────────────────────────────
const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const {
    token,
    isAuthenticated,
    isHydrated,
    profile,
    onboardingSubmitted,
    hasSeenOnboarding,
    setProfile,
    setOnboardingSubmitted,
  } = useAuthStore();

  const [nextRoute,      setNextRoute]      = useState<string | null>(null);
  const [isAnimComplete, setIsAnimComplete] = useState(false);

  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const poweredOpacity    = useRef(new Animated.Value(0)).current;
  const logoOpacity       = useRef(new Animated.Value(1)).current;
  const riderOpacity      = useRef(new Animated.Value(0)).current;
  const riderTranslateY   = useRef(new Animated.Value(20)).current;
  const taglineOpacity    = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const hasJwt = Boolean(token);
    if (!isAuthenticated && !hasJwt) {
      const dest = hasSeenOnboarding ? 'Welcome' : 'Onboarding';
      setNextRoute(dest);
      return;
    }

    const checkStatus = async () => {
      const cachedProfile = useAuthStore.getState().profile ?? profile;
      let isResolved = false;

      const timeoutFallback = setTimeout(() => {
        if (!isResolved) {
          if (cachedProfile?.verification_status === 'APPROVED') {
            setNextRoute('MainTabs');
          } else if (cachedProfile?.verification_status) {
            setNextRoute('KYCStatus');
          } else {
            setNextRoute('KYCVehicleRegistration');
          }
        }
      }, 3000);

      try {
        const status = await getVerificationStatus();
        isResolved = true;
        clearTimeout(timeoutFallback);

        if (status.verification_status === 'APPROVED') {
          // Pre-fetch profile if approved
          getDriverProfile()
            .then(p => setProfile(p))
            .catch(() => {});

          setNextRoute('MainTabs');
        } else {
          if (onboardingSubmitted) {
            setNextRoute('KYCStatus');
            return;
          }
          const completed = await hasOnboardingData();
          if (completed) setOnboardingSubmitted(true);
          setNextRoute(completed ? 'KYCStatus' : 'KYCVehicleRegistration');
        }
      } catch (error) {
        isResolved = true;
        clearTimeout(timeoutFallback);
        const statusCode = getErrorStatusCode(error);

        if (statusCode === 404) {
          setNextRoute('KYCVehicleRegistration');
          return;
        }

        // 401 means both access and refresh tokens are expired -> force re-login.
        if (statusCode === 401) {
          setNextRoute('Welcome');
          return;
        }

        // Fallback to cached profile if offline or other error
        if (cachedProfile?.verification_status === 'APPROVED') {
          setNextRoute('MainTabs');
        } else if (cachedProfile?.verification_status) {
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
    hasSeenOnboarding,
    setProfile,
    setOnboardingSubmitted,
    onboardingSubmitted,
    profile,
  ]);

  useEffect(() => {
    if (nextRoute && isAnimComplete) {
      navigation.replace(nextRoute);
    }
  }, [nextRoute, isAnimComplete]);

  // ─── ANIMATION ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(poweredOpacity, {
      toValue: 1,
      duration: 400,
      delay: POWERED_DELAY,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
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
      setIsAnimComplete(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Solid royal-blue background ── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#1E22AD', opacity: backgroundOpacity },
        ]}
      />

      {/* ── Centre content ── */}
      <View style={styles.content}>

        {/* ── "Zipto" — hero brand word ── */}
        <View style={styles.lettersRow}>
          {ZIPTO_LETTERS.map((char, index) => (
            <LetterPop
              key={`zipto-${index}`}
              char={char}
              delay={ZIPTO_START + index * STAGGER_MS}
              style={styles.letterLarge}
            />
          ))}
        </View>

        {/* ── Subtitle block — "Rider" + "Onboarding" tight together ── */}
        <View style={styles.subtitleBlock}>

          {/* "Rider" */}
          <View style={styles.lettersRow}>
            {RIDER_LETTERS.map((char, index) => (
              <LetterPop
                key={`rider-${index}`}
                char={char}
                delay={RIDER_START + index * STAGGER_MS}
                style={styles.letterSub}
              />
            ))}
          </View>

          {/* "Onboarding" — zero gap, same line-height */}
          <View style={styles.lettersRow}>
            {ONBOARDING_LETTERS.map((char, index) => (
              <LetterPop
                key={`onboarding-${index}`}
                char={char}
                delay={ONBOARDING_START + index * STAGGER_MS}
                style={styles.letterSub}
              />
            ))}
          </View>

        </View>
      </View>

      {/* ── Bottom branding ── */}
      <Animated.Text style={[styles.poweredBy, { opacity: poweredOpacity }]}>
        Powered by Zipto Technologies
      </Animated.Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E22AD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // "Rider Onboarding" block — sits snug below Zipto
  subtitleBlock: {
    alignItems: 'center',
    marginTop: scaleH(6),   // tight gap below "Zipto"
    gap: 0,                 // RN 0.71+ — no extra space between the two rows
  },

  // "Zipto" — large Cocon hero
  letterLarge: {
    fontSize:      fs(68),
    fontWeight:    'normal',
    color:         '#FFFFFF',
    fontFamily:    'Cocon-Regular',
    letterSpacing: ms(1.5),
    lineHeight:    fs(72),
  },

  // "Rider" + "Onboarding" — compact, bold, tight line-height
  letterSub: {
    fontSize:      fs(26),
    fontWeight:    'normal',
    color:         '#FFFFFF',
    fontFamily:    'Poppins-Bold',
    letterSpacing: ms(0.8),
    lineHeight:    fs(30),  // keeps the two rows flush with no breathing room
  },

  poweredBy: {
    fontSize:      fs(12),
    color:         'rgba(255,255,255,0.35)',
    fontFamily:    'Cocon-Regular',
    letterSpacing: ms(0.5),
    textAlign:     'center',
    paddingBottom: scaleH(32),
  },
});

export default SplashScreen;