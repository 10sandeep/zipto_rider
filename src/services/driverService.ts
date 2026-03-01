/**
 * ============================================================
 * DRIVER SERVICE
 * Driver-specific API methods
 * ============================================================
 */

import apiClient from './api';
import {ENDPOINTS} from '../config/api.config';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationStatusResponse {
  is_verified: boolean;
  verification_status: VerificationStatus;
  message: string;
}

/**
 * Get the current verification status of the driver.
 * Returns 404 if driver profile doesn't exist yet.
 */
export const getVerificationStatus = async (): Promise<VerificationStatusResponse> => {
  const response = await apiClient.get<{data: VerificationStatusResponse; success: boolean}>(
    ENDPOINTS.VERIFICATION_STATUS,
  );
  const data = response.data.data || (response.data as unknown as VerificationStatusResponse);
  if (data && typeof data.verification_status === 'string') {
    data.verification_status = data.verification_status.toUpperCase() as VerificationStatus;
  }
  return data;
};

export interface DriverProfile {
  id: string;
  name?: string;
  phone?: string;
  email: string | null;
  role?: string;
  verification_status: VerificationStatus;
  is_verified?: boolean;
  is_active?: boolean;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  
  // New API fields
  wallet_balance?: string | number;
  average_rating?: string | number | null;
  total_trips?: number;
  availability_status?: string;
  address?: string | null;
}

/**
 * Get the current driver's profile information.
 */
export const getDriverProfile = async (): Promise<DriverProfile> => {
  const response = await apiClient.get<{data: DriverProfile; success: boolean}>(
    ENDPOINTS.DRIVER_PROFILE,
  );
  return response.data.data || (response.data as unknown as DriverProfile);
};

export interface TripData {
  // Typical backend fields, adapt when exact structure known
  id?: string;
  status?: string;
  amount?: number | string;
  distance?: string;
  pickup_location?: string;
  dropoff_location?: string;
  created_at?: string;
  [key: string]: any;
}

export interface TripsResponse {
  trips: TripData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Get the driver's trip history with pagination
 */
export const getDriverTrips = async (
  page: number = 1,
  limit: number = 10
): Promise<TripsResponse> => {
  const response = await apiClient.get<{data: TripsResponse; success: boolean}>(
    `${ENDPOINTS.DRIVER_TRIPS}?page=${page}&limit=${limit}`,
  );
  return response.data.data || (response.data as unknown as TripsResponse);
};

export interface DailyStatsResponse {
  today_earnings: number;
  today_orders: number;
}

export const getDailyStats = async (): Promise<DailyStatsResponse> => {
  const response = await apiClient.get<{data: DailyStatsResponse; success: boolean}>(
    ENDPOINTS.DAILY_STATS,
  );
  return response.data.data || (response.data as unknown as DailyStatsResponse);
};

export interface UpdateAvailabilityPayload {
  availability_status: 'online' | 'offline';
}

export const updateAvailability = async (payload: UpdateAvailabilityPayload): Promise<boolean> => {
  const response = await apiClient.put<{success: boolean; message?: string}>(
    ENDPOINTS.DRIVER_AVAILABILITY,
    payload,
  );
  return response.data.success;
};

export interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
}

export const updateLocation = async (payload: UpdateLocationPayload): Promise<boolean> => {
  const response = await apiClient.put<{success: boolean; message?: string}>(
    ENDPOINTS.DRIVER_LOCATION,
    payload,
  );
  return response.data.success;
};

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type: string;
  registration_number: string;
  capacity: number;
  vehicle_model: string;
  insurance_details: string | null;
  rc_document_url: string | null;
  insurance_document_url: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export const getMyVehicles = async (): Promise<Vehicle[]> => {
  const response = await apiClient.get<{success: boolean; data: Vehicle[]}>(
    ENDPOINTS.MY_VEHICLES,
  );
  return response.data.data;
};

export interface DriverRating {
  id: string;
  driver_id: string;
  customer_id: string;
  rating: number;
  review: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
  };
  order?: {
    id: string;
    order_number: string;
  }
}

export interface DriverRatingsResponse {
  ratings: DriverRating[];
  statistics: {
    average_rating: number;
    total_ratings: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const getDriverRatings = async (driverId: string): Promise<DriverRatingsResponse> => {
  const response = await apiClient.get<{success: boolean; data: DriverRatingsResponse}>(
    ENDPOINTS.GET_DRIVER_RATING(driverId)
  );
  return response.data.data;
};

export const acceptBooking = async (bookingId: string, vehicleId: string): Promise<boolean> => {
  try {
    const response = await apiClient.put<{success: boolean; message?: string}>(
      ENDPOINTS.ACCEPT_BOOKING(bookingId),
      {vehicle_id: vehicleId}
    );
    return response.data.success;
  } catch (error) {
    console.error(`[DriverService] Accept booking ${bookingId} failed:`, error);
    return false;
  }
};
