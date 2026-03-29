declare module 'react-native-sound' {
  class Sound {
    static MAIN_BUNDLE: string;
    static DOCUMENT: string;
    static LIBRARY: string;
    static CACHES: string;

    static setCategory(category: string, mixWithOthers?: boolean): void;
    static setMode(mode: string): void;
    static setActive(active: boolean): void;
    static enableInSilenceMode(enabled: boolean): void;
    static setSpeakerPhoneOn(enabled: boolean): void;

    constructor(
      filename: string,
      basePath: string | null,
      onError?: (error: SoundError) => void
    );

    play(onComplete?: (success: boolean) => void): void;
    pause(): void;
    stop(onComplete?: () => void): void;
    release(): void;
    reset(): void;
    getCurrentTime(callback: (seconds: number) => void): void;
    getDuration(): number;
    getNumberOfChannels(callback: (channels: number) => void): void;
    getVolume(callback: (volume: number) => void): void;
    setVolume(volume: number): void;
    getPan(callback: (pan: number) => void): void;
    setPan(pan: number): void;
    getSpeed(callback: (speed: number) => void): void;
    setSpeed(speed: number): void;
    getPitch(callback: (pitch: number) => void): void;
    setPitch(pitch: number): void;
    isLoaded(): boolean;
    isPlaying(): boolean;
    isLooping(): boolean;
    setLooping(isLooping: boolean): void;
    setCurrentTime(seconds: number): void;
  }

  interface SoundError {
    code: string;
    message: string;
  }

  export default Sound;
}
