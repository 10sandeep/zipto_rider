/**
 * Firebase Cloud Messaging service for the Zipto Rider app.
 *
 * SETUP REQUIRED (one-time):
 * 1. Add your project's google-services.json to android/app/
 * 2. In android/build.gradle (project level) add:
 *      classpath 'com.google.gms:google-services:4.4.2'
 * 3. In android/app/build.gradle add at the bottom:
 *      apply plugin: 'com.google.gms.google-services'
 * 4. Install packages:
 *      npm install @react-native-firebase/app @react-native-firebase/messaging
 *      npx pod-install  (iOS only)
 *
 * The service uses conditional require so the app still runs if
 * Firebase is not yet configured — all functions return null/no-op.
 */

type MessageHandler = (message: any) => void;
let _unsubscribeForeground: (() => void) | null = null;

function getMessaging(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
}

/**
 * Request notification permission and return the FCM token.
 * Returns null if permission is denied or Firebase is not configured.
 */
export async function requestPermissionAndGetToken(): Promise<string | null> {
  const messaging = getMessaging();
  if (!messaging) return null;

  try {
    const authStatus = await messaging().requestPermission();
    // 1 = AUTHORIZED, 2 = PROVISIONAL
    const granted = authStatus === 1 || authStatus === 2;
    if (!granted) return null;

    const token = await messaging().getToken();
    return token ?? null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to foreground messages (app is open and in foreground).
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(handler: MessageHandler): () => void {
  const messaging = getMessaging();
  if (!messaging) return () => {};
  try {
    return messaging().onMessage(handler);
  } catch {
    return () => {};
  }
}

/**
 * Register a background message handler.
 * Must be called before the app fully boots (call from index.js or App.tsx root).
 */
export function registerBackgroundHandler(): void {
  const messaging = getMessaging();
  if (!messaging) return;
  try {
    messaging().setBackgroundMessageHandler(async (_msg: any) => {
      // Message is handled by the OS notification tray automatically.
      // Add custom background processing here if needed.
    });
  } catch {
    // Firebase not configured — safe to ignore
  }
}

/**
 * Subscribe to when the user taps a notification that opened the app.
 */
export function onNotificationOpenedApp(handler: MessageHandler): () => void {
  const messaging = getMessaging();
  if (!messaging) return () => {};
  try {
    return messaging().onNotificationOpenedApp(handler);
  } catch {
    return () => {};
  }
}

/**
 * Check if the app was launched by tapping a notification.
 * Returns the initial notification if so.
 */
export async function getInitialNotification(): Promise<any | null> {
  const messaging = getMessaging();
  if (!messaging) return null;
  try {
    return await messaging().getInitialNotification();
  } catch {
    return null;
  }
}

/**
 * Subscribe to FCM token refresh events.
 * Should call registerFcmToken again when the token changes.
 */
export function onTokenRefresh(handler: (token: string) => void): () => void {
  const messaging = getMessaging();
  if (!messaging) return () => {};
  try {
    return messaging().onTokenRefresh(handler);
  } catch {
    return () => {};
  }
}

/**
 * Unsubscribe the current foreground listener (if any).
 */
export function unsubscribeForeground(): void {
  if (_unsubscribeForeground) {
    _unsubscribeForeground();
    _unsubscribeForeground = null;
  }
}
