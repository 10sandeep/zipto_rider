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

// ─── Animation constants ───────────────────────────────────────────────────────
const STAGGER_MS = 100;

const ZIPTO_LETTERS      = ['Z', 'i', 'p', 't', 'o'];
const RIDER_LETTERS      = ['R', 'i', 'd', 'e', 'r'];
const ONBOARDING_LETTERS = ['O', 'n', 'b', 'o', 'a', 'r', 'd', 'i', 'n', 'g'];

const ZIPTO_START      = 0;
const RIDER_START      = ZIPTO_LETTERS.length * STAGGER_MS + 280;
const ONBOARDING_START = RIDER_START + RIDER_LETTERS.length * STAGGER_MS + 80;
const POWERED_DELAY    = ONBOARDING_START + ONBOARDING_LETTERS.length * STAGGER_MS + 380;

const HOLD_AFTER_LETTERS = 2500;
const FADE_OUT_DURATION  = 800;
const NAV_BUFFER         = 400;

// ── This is the TOTAL time the splash must stay on screen before navigating ──
// Animation starts → letters pop → hold → fade → buffer → navigate
const MIN_SPLASH_MS =
  POWERED_DELAY + HOLD_AFTER_LETTERS + FADE_OUT_DURATION + NAV_BUFFER;

// ─── Single letter with pop animation ─────────────────────────────────────────
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

// ─── Splash screen ─────────────────────────────────────────────────────────────
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

  // Store resolved route and whether animation sequence is fully done
  const nextRouteRef      = useRef<string | null>(null);
  const animDoneRef       = useRef(false);
  const splashStartTime   = useRef(Date.now());

  // Track state for re-render trigger only
  const [routeReady, setRouteReady] = useState(false);
  const [animReady,  setAnimReady]  = useState(false);

  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const poweredOpacity    = useRef(new Animated.Value(0)).current;
  const contentOpacity    = useRef(new Animated.Value(1)).current;

  // ─── Attempt navigation — only fires when BOTH are ready ─────────────────────
  const tryNavigate = (routeOverride?: string) => {
    const route = routeOverride ?? nextRouteRef.current;
    if (!route) return;
    if (!animDoneRef.current) return;

    // Enforce minimum splash duration from mount time
    const elapsed   = Date.now() - splashStartTime.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    setTimeout(() => {
      navigation.replace(route);
    }, remaining);
  };

  // ─── Route resolution ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    const resolveRoute = async () => {
      const hasJwt = Boolean(token);

      if (!isAuthenticated && !hasJwt) {
        const dest = hasSeenOnboarding ? 'Welcome' : 'Onboarding';
        nextRouteRef.current = dest;
        setRouteReady(true);
        return;
      }

      const cachedProfile = useAuthStore.getState().profile ?? profile;

      // Fallback if API hangs
      const timeoutId = setTimeout(() => {
        if (!nextRouteRef.current) {
          if (cachedProfile?.verification_status === 'APPROVED') {
            nextRouteRef.current = 'MainTabs';
          } else if (cachedProfile?.verification_status) {
            nextRouteRef.current = 'KYCStatus';
          } else {
            nextRouteRef.current = 'KYCVehicleRegistration';
          }
          setRouteReady(true);
        }
      }, 3000);

      try {
        const status = await getVerificationStatus();
        clearTimeout(timeoutId);

        if (status.verification_status === 'APPROVED') {
          getDriverProfile()
            .then(p => setProfile(p))
            .catch(() => {});
          nextRouteRef.current = 'MainTabs';
        } else {
          if (onboardingSubmitted) {
            nextRouteRef.current = 'KYCStatus';
          } else {
            const completed = await hasOnboardingData();
            if (completed) setOnboardingSubmitted(true);
            nextRouteRef.current = completed ? 'KYCStatus' : 'KYCVehicleRegistration';
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        const statusCode = getErrorStatusCode(error);

        if (statusCode === 404) {
          nextRouteRef.current = 'KYCVehicleRegistration';
        } else if (statusCode === 401) {
          nextRouteRef.current = 'Welcome';
        } else if (cachedProfile?.verification_status === 'APPROVED') {
          nextRouteRef.current = 'MainTabs';
        } else if (cachedProfile?.verification_status) {
          nextRouteRef.current = 'KYCStatus';
        } else {
          nextRouteRef.current = 'KYCVehicleRegistration';
        }
      }

      setRouteReady(true);
    };

    resolveRoute();
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

  // ─── Try navigate whenever route becomes ready ────────────────────────────────
  useEffect(() => {
    if (routeReady) tryNavigate();
  }, [routeReady]);

  // ─── Try navigate whenever animation becomes ready ────────────────────────────
  useEffect(() => {
    if (animReady) tryNavigate();
  }, [animReady]);

  // ─── Animation sequence ───────────────────────────────────────────────────────
  useEffect(() => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // "Powered by" fade in
    Animated.timing(poweredOpacity, {
      toValue: 1,
      duration: 500,
      delay: POWERED_DELAY,
      useNativeDriver: true,
    }).start();

    // After hold period → fade everything out
    const fadeOutTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: FADE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(poweredOpacity, {
          toValue: 0,
          duration: FADE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: FADE_OUT_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          animDoneRef.current = true;
          setAnimReady(true); // triggers tryNavigate via useEffect
        }, NAV_BUFFER);
      });
    }, POWERED_DELAY + HOLD_AFTER_LETTERS);

    return () => clearTimeout(fadeOutTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#1E22AD', opacity: backgroundOpacity },
        ]}
      />

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
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

        <View style={styles.subtitleBlock}>
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
      </Animated.View>

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
  subtitleBlock: {
    alignItems: 'center',
    marginTop: scaleH(6),
    gap: 0,
  },
  letterLarge: {
    fontSize:      fs(68),
    fontWeight:    'normal',
    color:         '#FFFFFF',
    fontFamily:    'Cocon-Regular',
    letterSpacing: ms(1.5),
    lineHeight:    fs(72),
  },
  letterSub: {
    fontSize:      fs(26),
    fontWeight:    'normal',
    color:         '#FFFFFF',
    fontFamily:    'Poppins-Bold',
    letterSpacing: ms(0.8),
    lineHeight:    fs(30),
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