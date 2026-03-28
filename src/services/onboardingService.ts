/**
 * ============================================================
 * ONBOARDING SERVICE
 * Builds multipart/form-data and submits to POST /driver/onboard
 * ============================================================
 */
import {Platform} from 'react-native';
import {ENDPOINTS, API_BASE_URL} from '../config/api.config';
import type {OnboardingState, DocumentFiles} from '../store/onboardingStore';

// ─── Response Types ───────────────────────────────────────────
export interface OnboardingDriverResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  license_number: string;
  license_expiry: string;
  vehicle_registration_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_capacity: number;
  documents: Record<string, string>;
  is_verified: boolean;
  created_at: string;
}

export interface OnboardingResponse {
  message: string;
  driver: OnboardingDriverResponse;
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Append a file URI to FormData with the correct MIME type.
 * React Native's FormData expects {uri, type, name}.
 */
const appendFile = (
  formData: FormData,
  fieldName: string,
  uri: string | null,
) => {
  if (!uri) return;

  // Determine MIME type from extension
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  const type = mimeMap[extension] ?? 'image/jpeg';

  // Generate a unique filename
  const fileName = `${fieldName}_${Date.now()}.${extension}`;

  formData.append(fieldName, {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    type,
    name: fileName,
  } as any);
};

// ─── Submit Onboarding ────────────────────────────────────────
export const submitOnboarding = async (
  state: Omit<OnboardingState, 'setVehicle' | 'setDocuments' | 'setProfile' | 'reset'>,
): Promise<OnboardingResponse> => {
  // Verify we have an auth token before attempting upload
  const {useAuthStore} = require('../store/authStore');
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error('No auth token found. Please log in again.');
  }

  const formData = new FormData();

  // Text fields
  formData.append('name', state.name);
  formData.append('email', state.email);
  formData.append('address', state.address);
  formData.append('license_number', state.licenseNumber);
  formData.append('license_expiry', state.licenseExpiry);
  formData.append('vehicle_registration_number', state.vehicleRegistrationNumber);
  formData.append('vehicle_type', state.vehicleType ?? 'bike');
  formData.append('vehicle_model', state.vehicleModel);
  formData.append('vehicle_capacity', state.vehicleCapacity);

  // File fields
  const docKeys: (keyof DocumentFiles)[] = [
    'aadhar_front',
    'aadhar_back',
    'driving_license',
    'vehicle_rc',
    'profile_photo',
  ];

  for (const key of docKeys) {
    appendFile(formData, key, state.documents[key]);
  }

  // Use fetch instead of axios for multipart uploads
  // Axios's default Content-Type: application/json conflicts with FormData
  // React Native's fetch handles FormData natively with correct boundary
  const url = `${API_BASE_URL}${ENDPOINTS.DRIVER_ONBOARD}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — fetch auto-sets it with boundary for FormData
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.message;
    const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg || `Upload failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return json;
};

/**
 * Extract a readable error message from API errors.
 */
export const getOnboardingErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {response?: {data?: {message?: string | string[]}}};
    const msg = axiosError.response?.data?.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return 'No internet connection. Please check your network and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Upload timed out. Please check your connection and try again.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};
