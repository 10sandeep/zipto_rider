import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';

// Import Tab Navigator
import TabNavigator from '../navigation/TabNavigation';

// Import Auth & Onboarding Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';

// Import KYC Flow Screens
import KYCVehicleRegistrationScreen from '../screens/KYCVehicleRegistrationScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import KYCStatusScreen from '../screens/KYCStatusScreen';

// Import Order Related Screens
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import NavigationScreen from '../screens/NavigationScreen';

// Import Profile & Settings Screens
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SupportScreen from '../screens/SupportScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import RatingsReviewsScreen from '../screens/RatingsReviewsScreen';
import AttendanceScreen from '../screens/AttendanceScreen';

// Import Policy Screens
import PrivacyPolicyScreen from '../screens/PrivacyPolicy';
import ConductScreen from '../screens/ConductScreen';
import CancellationPolicyScreen from '../screens/CancellationScreen';
import PaymentsScreen from '../screens/PaymentPolicy';
import TermsConditionScreen from '../screens/TermsCondition';
import AboutUsScreen from '../screens/AboutUs';

// Type definitions for Stack Navigator
export type RootStackParamList = {
  // Auth & Onboarding
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  OTPVerification: {phoneNumber: string; flow: 'register' | 'login'};

  // KYC Flow
  KYCVehicleRegistration: undefined;
  DocumentUpload: undefined;
  ProfileSetup: undefined;
  KYCStatus: undefined;

  // Main App
  MainTabs: undefined;

  // Orders
  OrderDetails: {orderId: string};
  Navigation: {bookingId: string};

  // Profile & Settings
  Settings: undefined;
  Notifications: undefined;
  Support: undefined;
  VehicleDetails: undefined;
  BankDetails: undefined;
  RatingsReviews: undefined;
  Attendance: undefined;

  // Policies
  PrivacyPolicy: undefined;
  ConductPolicy: undefined;
  CancellationPolicy: undefined;
  PaymentPolicy: undefined;
  TermsCondition: undefined;
  AboutUs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
};

// Main App Navigation
export default function AppNavigation() {
  const {isAuthenticated, isHydrated} = useAuthStore();

  // Wait for Zustand to rehydrate from AsyncStorage before deciding which stack to show
  if (!isHydrated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          // ── AUTH STACK ─────────────────────────────────────────────
          // Splash handles routing to Onboarding or Welcome based on hasSeenOnboarding
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
            />
            <Stack.Screen
              name="KYCVehicleRegistration"
              component={KYCVehicleRegistrationScreen}
            />
            <Stack.Screen
              name="DocumentUpload"
              component={DocumentUploadScreen}
            />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="KYCStatus" component={KYCStatusScreen} />
          </>
        ) : (
          // ── APP STACK ──────────────────────────────────────────────
          // Shown when authenticated
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* KYC screens needed for newly registered drivers who are authenticated but haven't completed KYC */}
            <Stack.Screen
              name="KYCVehicleRegistration"
              component={KYCVehicleRegistrationScreen}
            />
            <Stack.Screen
              name="DocumentUpload"
              component={DocumentUploadScreen}
            />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="KYCStatus" component={KYCStatusScreen} />

            {/* Orders */}
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="Navigation" component={NavigationScreen} />

            {/* Profile & Settings */}
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen
              name="VehicleDetails"
              component={VehicleDetailsScreen}
            />
            <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
            <Stack.Screen
              name="RatingsReviews"
              component={RatingsReviewsScreen}
            />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />

            {/* Policies */}
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
            <Stack.Screen name="ConductPolicy" component={ConductScreen} />
            <Stack.Screen
              name="CancellationPolicy"
              component={CancellationPolicyScreen}
            />
            <Stack.Screen name="PaymentPolicy" component={PaymentsScreen} />
            <Stack.Screen
              name="TermsCondition"
              component={TermsConditionScreen}
            />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * ==================== NAVIGATION FLOW ====================
 *
 * 1. FIRST TIME USER (REGISTRATION):
 *    Splash → Onboarding → Welcome → Register → OTPVerification →
 *    KYCVehicleRegistration → DocumentUpload → ProfileSetup →
 *    KYCStatus → MainTabs (Home)
 *
 * 2. RETURNING USER (LOGIN):
 *    Splash → Welcome → Login → OTPVerification → MainTabs (Home)
 *
 * 3. MAIN APP NAVIGATION:
 *    MainTabs (Home, Orders, Earnings, Profile)
 *    ├── From Home → OrderDetails → Navigation
 *    ├── From Profile → Settings, VehicleDetails, BankDetails, etc.
 *    ├── From Profile → PrivacyPolicy, ConductPolicy, CancellationPolicy, PaymentPolicy
 *    └── Global Access → Notifications, Support
 *
 * ==================== NOTES ====================
 * - TabNavigator handles: Home, OrderHistory, Earnings, Profile
 * - All other screens are in the main Stack
 * - Authentication flow is separated from main app flow
 * - KYC flow is only for new registrations
 * - Splash screen handles routing logic:
 *     Unauthenticated: hasSeenOnboarding → Welcome, else → Onboarding
 *     Authenticated:   verification_status → MainTabs or KYCStatus or KYCVehicleRegistration
 */