/**
 * ============================================================
 * AUTH SERVICE
 * Zipto Rider App — Driver Registration & OTP API Methods
 * ============================================================
 */

import apiClient from './api';
import {ENDPOINTS} from '../config/api.config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendOTPResponse {
  message: string;
  success: boolean;
  isNewUser?: boolean;
}

export interface VerifyOTPData {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    phone: string;
    role: string;
    name?: string;
    email?: string | null;
    is_verified?: boolean;
    is_active?: boolean;
  };
}

/** Raw API envelope: { success, data, timestamp } */
interface VerifyOTPApiResponse {
  success: boolean;
  data: VerifyOTPData;
  timestamp: string;
}

export type OTPRole = 'driver';

// ─── Helper: extract readable error message ───────────────────────────────────
export const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {response?: {data?: {message?: string | string[]}}};
    const msg = axiosError.response?.data?.message;
    if (Array.isArray(msg)) {
      return msg.join('\n');
    }
    if (typeof msg === 'string') {
      return msg;
    }
  }
  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return 'No internet connection. Please check your network and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

/**
 * Step 1 — Register: Send OTP to driver's phone number.
 * Endpoint: POST /auth/driver/register
 */
export const sendRegisterOTP = async (phone: string): Promise<SendOTPResponse> => {
  const response = await apiClient.post<SendOTPResponse>(ENDPOINTS.DRIVER_REGISTER, {
    phone,
    role: 'driver',
  });
  return response.data;
};

/**
 * Step 1 (Login flow) — Same endpoint as register; server handles existing/new users.
 * Endpoint: POST /auth/driver/register
 */
export const sendLoginOTP = async (phone: string): Promise<SendOTPResponse> => {
  const response = await apiClient.post<SendOTPResponse>(ENDPOINTS.DRIVER_REGISTER, {
    phone,
    role: 'driver',
  });
  return response.data;
};

/**
 * Step 2 — Verify OTP and complete registration/login.
 * Endpoint: POST /auth/verify-otp
 */
export const verifyOTP = async (
  phone: string,
  otp: string,
  role: OTPRole = 'driver',
): Promise<VerifyOTPData> => {
  const response = await apiClient.post<VerifyOTPApiResponse>(ENDPOINTS.VERIFY_OTP, {
    phone,
    otp,
    role,
  });
  // Unwrap the { success, data, timestamp } envelope
  return response.data.data;
};
