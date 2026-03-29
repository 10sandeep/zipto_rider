/**
 * ============================================================
 * API CLIENT
 * Zipto Rider App — Axios Instance with Interceptors
 * ============================================================
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_BASE_URL, API_TIMEOUT, ENDPOINTS} from '../config/api.config';

// Import store directly (safe — no circular dependency in React Native bundler)
import {useAuthStore} from '../store/authStore';

// ─── Create Axios Instance ────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach Bearer token to every request if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = useAuthStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If store is unavailable, proceed without token
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Normalise success responses; handle 401 by clearing session or refreshing token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If the error is 401 and not from the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (originalRequest.url === ENDPOINTS.REFRESH_TOKEN) {
        // Refresh token failed — clear local session and logout
        try {
          useAuthStore.getState().clearAuth();
        } catch {
          // Store unavailable
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const {refreshToken, setAuth, user} = useAuthStore.getState();
        if (!refreshToken || !user) {
          console.warn('[API] 401 — no refresh token, logging out');
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`,
          {refresh_token: refreshToken},
          {headers: {'Content-Type': 'application/json'}},
        );

        const newAccessToken =
          refreshResponse.data?.data?.access_token ||
          refreshResponse.data?.access_token ||
          refreshResponse.data?.token;
        const newRefreshToken =
          refreshResponse.data?.data?.refresh_token ||
          refreshResponse.data?.refresh_token ||
          refreshToken;

        if (newAccessToken) {
          setAuth(newAccessToken, user, newRefreshToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('[API] Refresh token failed — logging out');
        // Refresh failed: clear auth → navigation reacts automatically
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
