import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Configure Sound for appropriate platform
Sound.setCategory(Platform.OS === 'ios' ? 'Ambient' : 'Playback');

let bookingAlertSound: Sound | null = null;
let isInitialized = false;
let isInitializing = false;

const initializeSound = (): Promise<boolean> => {
  return new Promise(resolve => {
    // If already initialized or initializing, return current state
    if (isInitialized) {
      resolve(true);
      return;
    }
    if (isInitializing) {
      // Wait for initialization to complete
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          resolve(isInitialized);
        }
      }, 100);
      return;
    }

    isInitializing = true;

    try {
      // Capture instance locally so callback doesn't depend on module variable
      const soundInstance = new Sound(
        'booking_alert.wav',
        Sound.MAIN_BUNDLE,
        (error: Error | null) => {
          isInitializing = false;

          if (error) {
            console.warn(
              '[SoundService] Failed to load booking_alert.wav:',
              error.message,
            );
            bookingAlertSound = null;
            isInitialized = false;
            resolve(false);
            return;
          }

          (soundInstance as any).setNumberOfLoops(-1); // loop until stopped
          bookingAlertSound = soundInstance;
          isInitialized = true;
          console.log('[SoundService] Successfully loaded booking_alert.wav');
          resolve(true);
        },
      );
    } catch (err) {
      console.error('[SoundService] Error creating Sound object:', err);
      isInitializing = false;
      isInitialized = false;
      bookingAlertSound = null;
      resolve(false);
    }
  });
};

export const playBookingAlertSound = async (): Promise<boolean> => {
  try {
    // Ensure sound is initialized
    const initialized = await initializeSound();

    if (!initialized || !bookingAlertSound || !bookingAlertSound.isLoaded()) {
      console.warn('[SoundService] Sound not initialized or loaded, cannot play');
      return false;
    }

    const playSound = (): Promise<boolean> => {
      return new Promise(resolve => {
        try {
          bookingAlertSound?.play((success: boolean) => {
            if (!success) {
              console.warn('[SoundService] Failed to play booking alert sound');
              resolve(false);
            } else {
              console.log('[SoundService] Booking alert sound played successfully');
              resolve(true);
            }
          });
        } catch (playError) {
          console.error('[SoundService] Error during play:', playError);
          resolve(false);
        }
      });
    };

    if (bookingAlertSound.isPlaying && bookingAlertSound.isPlaying()) {
      return new Promise(resolve => {
        try {
          bookingAlertSound.stop(() => {
            playSound().then(resolve).catch(err => {
              console.error('[SoundService] Error after stop play:', err);
              resolve(false);
            });
          });
        } catch (stopError) {
          console.error('[SoundService] Error stopping sound:', stopError);
          playSound().then(resolve).catch(err => {
            console.error('[SoundService] Error in fallback play:', err);
            resolve(false);
          });
        }
      });
    }

    return playSound();
  } catch (err) {
    console.error('[SoundService] Error playing booking alert:', err);
    return false;
  }
};

export const releaseBookingAlertSound = (): void => {
  try {
    if (!bookingAlertSound) {
      return;
    }

    const cleanup = () => {
      try {
        bookingAlertSound?.release();
      } catch (releaseError) {
        console.warn('[SoundService] Failed to release sound object:', releaseError);
      }
      bookingAlertSound = null;
      isInitialized = false;
    };

    if (bookingAlertSound.isLoaded && bookingAlertSound.isLoaded()) {
      try {
        if (bookingAlertSound.isPlaying && bookingAlertSound.isPlaying()) {
          bookingAlertSound.stop(() => {
            cleanup();
          });
        } else {
          cleanup();
        }
      } catch (stopError) {
        console.warn('[SoundService] Error stopping before release:', stopError);
        cleanup();
      }
    } else {
      cleanup();
    }
  } catch (err) {
    console.error('[SoundService] Error releasing sound:', err);
    bookingAlertSound = null;
    isInitialized = false;
  }
};

export const stopBookingAlertSound = (): void => {
  try {
    if (bookingAlertSound && bookingAlertSound.isLoaded()) {
      bookingAlertSound.stop();
    }
  } catch (err) {
    console.warn('[SoundService] Error stopping sound:', err);
  }
};

export const pauseBookingAlertSound = (): void => {
  try {
    if (bookingAlertSound) {
      bookingAlertSound.pause((_error: Error | null) => {
        // Error logged internally if needed
      });
    }
  } catch (err) {
    console.error('[SoundService] Error pausing sound:', err);
  }
};

// Initialize sound when service is imported
initializeSound().catch(err =>
  console.warn('[SoundService] Failed to initialize on import:', err),
);
