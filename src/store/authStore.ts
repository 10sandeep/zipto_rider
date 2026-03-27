/**
 * ============================================================
 * AUTH STORE
 * Zipto Rider App — Zustand store for authentication state
 * ============================================================
 */

import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

import {DriverProfile} from '../services/driverService';

export interface AuthUser {
  id: string;
  phone: string;
  role: string;
  name?: string;
  isVerified?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  profile: DriverProfile | null;
  onboardingSubmitted: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hasSeenOnboarding: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser, refreshToken?: string) => void;
  setProfile: (profile: DriverProfile) => void;
  setOnboardingSubmitted: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      refreshToken: null,
      user: null,
      profile: null,
      onboardingSubmitted: false,
      isAuthenticated: false,
      isHydrated: false,
      hasSeenOnboarding: false,

      setAuth: (token, user, refreshToken) => {
        const safeUser = user ?? {id: '', phone: 'unknown', role: 'driver'};
        set(state => ({
          token,
          refreshToken: refreshToken ?? null,
          user: safeUser,
          onboardingSubmitted: state.onboardingSubmitted,
          isAuthenticated: true,
        }));
      },

      setProfile: profile => {
        set({profile});
      },

      setOnboardingSubmitted: value => {
        set({onboardingSubmitted: value});
      },

      setHasSeenOnboarding: value => {
        set({hasSeenOnboarding: value});
      },

      clearAuth: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          profile: null,
          onboardingSubmitted: false,
          isAuthenticated: false,
        });
      },

      setHydrated: value => set({isHydrated: value}),
    }),
    {
      name: 'zipto-rider-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state?.setHydrated(true);
      },
      // Only persist auth tokens and user info
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        onboardingSubmitted: state.onboardingSubmitted,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
