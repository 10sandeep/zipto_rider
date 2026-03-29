import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigation from './src/navigation/AppNavigation';
import './src/i18n'; // Init i18n
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  requestPermissionAndGetToken,
  registerBackgroundHandler,
  onForegroundMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
} from './src/services/fcmService';
import {registerFcmToken} from './src/services/driverService';
import {useAuthStore} from './src/store/authStore';

// Register background handler as early as possible
registerBackgroundHandler();

function FcmInitializer() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isHydrated = useAuthStore(s => s.isHydrated);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    let foregroundUnsub: (() => void) | null = null;
    let tokenRefreshUnsub: (() => void) | null = null;
    let openedAppUnsub: (() => void) | null = null;

    const init = async () => {
      // Request permission + get token
      const token = await requestPermissionAndGetToken();
      if (token) {
        await registerFcmToken(token);
      }

      // Listen for foreground messages — show in-app notification or refresh inbox
      foregroundUnsub = onForegroundMessage(_message => {
        // The notification is already stored in Redis by the backend.
        // A real app might show a toast or badge here.
        // The NotificationsScreen will refresh automatically via socket.
      });

      // Listen for token refresh
      tokenRefreshUnsub = onTokenRefresh(async newToken => {
        await registerFcmToken(newToken);
      });

      // Handle notification tap (app was in background)
      openedAppUnsub = onNotificationOpenedApp(_message => {
        // Navigate to the relevant screen based on message.data
        // e.g. if message.data.type === 'booking_update', navigate to bookings
      });

      // Handle notification tap (app was quit)
      const initial = await getInitialNotification();
      if (initial) {
        // App was opened by a notification — handle deep link if needed
      }
    };

    init();

    return () => {
      foregroundUnsub?.();
      tokenRefreshUnsub?.();
      openedAppUnsub?.();
    };
  }, [isAuthenticated, isHydrated]);

  return null;
}

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppNavigation />
        <FcmInitializer />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;