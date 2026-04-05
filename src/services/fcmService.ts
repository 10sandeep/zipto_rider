/**
 * Firebase Cloud Messaging service for the Zipto Rider app.
 * Updated to use the new modular API (v22+) to remove deprecation warnings.
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

// ─── Modular API helpers ───────────────────────────────────────────────────────

function getMessagingModule(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging');
  } catch {
    return null;
  }
}

/**
 * Returns the messaging instance using the new modular getMessaging() call.
 * Replaces the old: messaging()
 */
function getMessagingInstance(): any | null {
  try {
    const mod = getMessagingModule();
    if (!mod) return null;
    // New modular API: use getMessaging() instead of messaging()
    return mod.getMessaging ? mod.getMessaging() : null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Request notification permission and return the FCM token.
 * Returns null if permission is denied or Firebase is not configured.
 */
export async function requestPermissionAndGetToken(): Promise<string | null> {
  try {
    const mod = getMessagingModule();
    if (!mod) return null;

    const instance = getMessagingInstance();
    if (!instance) return null;

    // New modular API: requestPermission(instance)
    const authStatus = await mod.requestPermission(instance);
    // 1 = AUTHORIZED, 2 = PROVISIONAL
    const granted = authStatus === 1 || authStatus === 2;
    if (!granted) return null;

    // New modular API: getToken(instance)
    const token = await mod.getToken(instance);
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
  try {
    const mod = getMessagingModule();
    if (!mod) return () => {};

    const instance = getMessagingInstance();
    if (!instance) return () => {};

    // New modular API: onMessage(instance, handler)
    return mod.onMessage(instance, handler);
  } catch {
    return () => {};
  }
}

/**
 * Register a background message handler.
 * Must be called before the app fully boots (call from index.js or App.tsx root).
 */
export function registerBackgroundHandler(): void {
  try {
    const mod = getMessagingModule();
    if (!mod) return;

    // New modular API: setBackgroundMessageHandler(handler)
    // Note: this does NOT take an instance — it's a top-level function
    if (mod.setBackgroundMessageHandler) {
      mod.setBackgroundMessageHandler(async (_msg: any) => {
        // Message is handled by the OS notification tray automatically.
        // Add custom background processing here if needed.
      });
    }
  } catch {
    // Firebase not configured — safe to ignore
  }
}

/**
 * Subscribe to when the user taps a notification that opened the app.
 */
export function onNotificationOpenedApp(handler: MessageHandler): () => void {
  try {
    const mod = getMessagingModule();
    if (!mod) return () => {};

    const instance = getMessagingInstance();
    if (!instance) return () => {};

    // New modular API: onNotificationOpenedApp(instance, handler)
    return mod.onNotificationOpenedApp(instance, handler);
  } catch {
    return () => {};
  }
}

/**
 * Check if the app was launched by tapping a notification.
 * Returns the initial notification if so.
 */
export async function getInitialNotification(): Promise<any | null> {
  try {
    const mod = getMessagingModule();
    if (!mod) return null;

    const instance = getMessagingInstance();
    if (!instance) return null;

    // New modular API: getInitialNotification(instance)
    return await mod.getInitialNotification(instance);
  } catch {
    return null;
  }
}

/**
 * Subscribe to FCM token refresh events.
 * Should call registerFcmToken again when the token changes.
 */
export function onTokenRefresh(handler: (token: string) => void): () => void {
  try {
    const mod = getMessagingModule();
    if (!mod) return () => {};

    const instance = getMessagingInstance();
    if (!instance) return () => {};

    // New modular API: onTokenRefresh(instance, handler)
    return mod.onTokenRefresh(instance, handler);
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