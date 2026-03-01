/**
 * ============================================================
 * ONBOARDING STORE
 * Ephemeral Zustand store — accumulates data across KYC screens
 * and is cleared after successful submission.
 * ============================================================
 */
import {create} from 'zustand';

// ─── Types ────────────────────────────────────────────────────
export type ApiVehicleType = 'bike' | 'tata_ace' | 'pickup_van' | 'mini_truck';

export interface DocumentFiles {
  aadhar_front: string | null;
  aadhar_back: string | null;
  driving_license: string | null;
  vehicle_rc: string | null;
  profile_photo: string | null;
}

export interface OnboardingState {
  // Step 1 — Vehicle Selection
  vehicleType: ApiVehicleType | null;
  vehicleModel: string;
  vehicleCapacity: string;
  vehicleRegistrationNumber: string;

  // Step 2 — Documents
  documents: DocumentFiles;
  licenseNumber: string;
  licenseExpiry: string;

  // Step 3 — Profile
  name: string;
  email: string;
  address: string;

  // Actions
  setVehicle: (data: {
    vehicleType: ApiVehicleType;
    vehicleModel: string;
    vehicleCapacity: string;
    vehicleRegistrationNumber: string;
  }) => void;

  setDocuments: (data: {
    documents: DocumentFiles;
    licenseNumber: string;
    licenseExpiry: string;
  }) => void;

  setProfile: (data: {
    name: string;
    email: string;
    address: string;
  }) => void;

  reset: () => void;
}

// ─── Initial state ────────────────────────────────────────────
const initialState = {
  vehicleType: null as ApiVehicleType | null,
  vehicleModel: '',
  vehicleCapacity: '',
  vehicleRegistrationNumber: '',
  documents: {
    aadhar_front: null,
    aadhar_back: null,
    driving_license: null,
    vehicle_rc: null,
    profile_photo: null,
  } as DocumentFiles,
  licenseNumber: '',
  licenseExpiry: '',
  name: '',
  email: '',
  address: '',
};

// ─── Store ────────────────────────────────────────────────────
export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setVehicle: (data) =>
    set({
      vehicleType: data.vehicleType,
      vehicleModel: data.vehicleModel,
      vehicleCapacity: data.vehicleCapacity,
      vehicleRegistrationNumber: data.vehicleRegistrationNumber,
    }),

  setDocuments: (data) =>
    set({
      documents: data.documents,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
    }),

  setProfile: (data) =>
    set({
      name: data.name,
      email: data.email,
      address: data.address,
    }),

  reset: () => set(initialState),
}));
