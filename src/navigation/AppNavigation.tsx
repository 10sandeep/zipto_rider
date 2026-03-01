import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

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
  Navigation: {orderId: string; destination: any};

  // Profile & Settings
  Settings: undefined;
  Notifications: undefined;
  Support: undefined;
  VehicleDetails: undefined;
  BankDetails: undefined;
  RatingsReviews: undefined;
  Attendance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main App Navigation
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {/* ==================== AUTH & ONBOARDING ==================== */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
        />

        {/* ==================== KYC FLOW ==================== */}
        <Stack.Screen
          name="KYCVehicleRegistration"
          component={KYCVehicleRegistrationScreen}
        />
        <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="KYCStatus" component={KYCStatusScreen} />

        {/* ==================== MAIN APP (TABS) ==================== */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* ==================== ORDER SCREENS ==================== */}
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />

        {/* ==================== PROFILE & SETTINGS ==================== */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
        <Stack.Screen name="RatingsReviews" component={RatingsReviewsScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
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
 *    └── Global Access → Notifications, Support
 *
 * ==================== NOTES ====================
 * - TabNavigator handles: Home, OrderHistory, Earnings, Profile
 * - All other screens are in the main Stack
 * - Authentication flow is separated from main app flow
 * - KYC flow is only for new registrations
 */
