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
  id?: string;
  status?: string;
  amount?: number | string;
  distance?: string;
  pickup_location?: string;
  dropoff_location?: string;
  vehicle_type?: string;
  service_category?: string;
  created_at?: string;
  completion_time?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  payment_status?: string;
  payment_method?: string | null;
  driver_earnings?: number | string | null;
  cancellation_reason?: string | null;
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
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
  };
  booking?: {
    id: string;
    pickup_address?: string;
    drop_address?: string;
    vehicle_type?: string;
    final_fare?: string;
    distance?: string;
  };
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

export interface AvailableBooking {
  id: string;
  pickup_address: string;
  drop_address: string;
  estimated_fare: number;
  distance: number;
  vehicle_type?: string;
  created_at: string;
}

export const getAvailableBookings = async (): Promise<AvailableBooking[]> => {
  try {
    const response = await apiClient.get<{success: boolean; data?: AvailableBooking[]}>(
      ENDPOINTS.AVAILABLE_BOOKINGS,
    );
    return response.data.data ?? (response.data as unknown as AvailableBooking[]) ?? [];
  } catch {
    return [];
  }
};

/** Returns real booking ID on success, or an error message string on failure */
export const acceptBooking = async (bookingId: string, vehicleId: string): Promise<{realBookingId: string} | string> => {
  try {
    const response = await apiClient.put<any>(
      ENDPOINTS.ACCEPT_BOOKING(bookingId),
      {vehicle_id: vehicleId},
    );
    const data = response.data?.data ?? response.data;
    const realBookingId: string = data?.id || bookingId;
    return {realBookingId};
  } catch (error: any) {
    const msg: string =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to accept booking. Please try again.';
    console.error(`[DriverService] Accept booking ${bookingId} failed:`, msg);
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
};

// ─── Bank Accounts ────────────────────────────────────────────────────────────

export type AccountType = 'savings' | 'current';

export interface BankAccount {
  id: string;
  driver_profile_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string;
  account_type: AccountType;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountPayload {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string;
  account_type?: AccountType;
}

export type UpdateBankAccountPayload = Partial<CreateBankAccountPayload>;

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await apiClient.get<{data: BankAccount[]} | BankAccount[]>(
    ENDPOINTS.BANK_ACCOUNTS,
  );
  return (response.data as any).data ?? (response.data as unknown as BankAccount[]) ?? [];
};

export const addBankAccount = async (payload: CreateBankAccountPayload): Promise<BankAccount> => {
  const response = await apiClient.post<{data: BankAccount} | BankAccount>(
    ENDPOINTS.BANK_ACCOUNTS,
    payload,
  );
  return (response.data as any).data ?? (response.data as unknown as BankAccount);
};

export const updateBankAccount = async (
  id: string,
  payload: UpdateBankAccountPayload,
): Promise<BankAccount> => {
  const response = await apiClient.put<{data: BankAccount} | BankAccount>(
    ENDPOINTS.BANK_ACCOUNT(id),
    payload,
  );
  return (response.data as any).data ?? (response.data as unknown as BankAccount);
};

export const deleteBankAccount = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.BANK_ACCOUNT(id));
};

export const setPrimaryBankAccount = async (id: string): Promise<BankAccount> => {
  const response = await apiClient.put<{data: BankAccount} | BankAccount>(
    ENDPOINTS.BANK_ACCOUNT_PRIMARY(id),
  );
  return (response.data as any).data ?? (response.data as unknown as BankAccount);
};

// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string;          // 'YYYY-MM-DD'
  day_of_week: string;   // 'Mon', 'Tue', etc.
  is_present: boolean;
  earnings: number;
  trips: number;
  hours_worked: number;
  first_trip_at: string | null; // 'HH:MM'
  last_trip_at: string | null;  // 'HH:MM'
}

export interface CalendarSummary {
  days_present: number;
  total_days: number;
  total_earnings: number;
  total_trips: number;
  total_hours: number;
}

export interface CalendarResponse {
  period: 'month' | 'week';
  year: number;
  month: number;
  week_start: string | null;
  week_end: string | null;
  summary: CalendarSummary;
  days: CalendarDay[];
}

export const getCalendar = async (
  period: 'month' | 'week',
  year: number,
  month: number,
  weekStart?: string,
): Promise<CalendarResponse> => {
  const params = new URLSearchParams({
    period,
    year: String(year),
    month: String(month),
  });
  if (weekStart) {params.append('week_start', weekStart);}
  const response = await apiClient.get<{data: CalendarResponse; success: boolean} | CalendarResponse>(
    `${ENDPOINTS.DRIVER_CALENDAR}?${params.toString()}`,
  );
  return (response.data as any).data ?? (response.data as unknown as CalendarResponse);
};

export interface DriverNotificationData {
  id: string;
  type: 'approval' | 'rejection' | 'payment' | 'weekly_earnings' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: number;
  read: boolean;
}

export const getNotifications = async (): Promise<DriverNotificationData[]> => {
  try {
    const response = await apiClient.get<{success: boolean; data: DriverNotificationData[]}>(
      ENDPOINTS.GET_NOTIFICATIONS,
    );
    return response.data.data ?? [];
  } catch {
    return [];
  }
};

export const markNotificationsRead = async (): Promise<void> => {
  try {
    await apiClient.post(ENDPOINTS.MARK_NOTIFICATIONS_READ);
  } catch {/* non-critical */}
};

export const clearNotifications = async (): Promise<void> => {
  try {
    await apiClient.delete(ENDPOINTS.CLEAR_NOTIFICATIONS);
  } catch {/* non-critical */}
};

// ─── Earnings ─────────────────────────────────────────────────────────────────

export interface EarningsBreakdown {
  base_fare: number;
  distance_charge: number;
  other_charges: number;
  platform_fee: number;
  gross_fare: number;
}

export interface EarningsDashboard {
  period: 'today' | 'week' | 'month';
  wallet_balance: number;
  total_earnings: number;
  trip_count: number;
  breakdown: EarningsBreakdown;
}

export const getEarningsDashboard = async (
  period: 'today' | 'week' | 'month' = 'today',
): Promise<EarningsDashboard> => {
  const response = await apiClient.get<{data: EarningsDashboard; success: boolean}>(
    `${ENDPOINTS.DRIVER_EARNINGS}?period=${period}`,
  );
  return response.data.data ?? (response.data as unknown as EarningsDashboard);
};

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  withdrawal_id: string;
  amount: number;
  remaining_balance: number;
}

export const requestWithdrawal = async (
  amount: number,
  bankAccountId?: string,
): Promise<WithdrawalResponse> => {
  const response = await apiClient.post<{data: WithdrawalResponse; success: boolean}>(
    ENDPOINTS.DRIVER_WITHDRAW,
    { amount, ...(bankAccountId && { bank_account_id: bankAccountId }) },
  );
  return response.data.data ?? (response.data as unknown as WithdrawalResponse);
};

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface WithdrawalRecord {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  bank_account_id: string | null;
  bank_account?: {
    bank_name: string;
    account_number: string;
  } | null;
  remarks: string | null;
  created_at: string;
}

export const getWithdrawalHistory = async (): Promise<WithdrawalRecord[]> => {
  const response = await apiClient.get<{data: WithdrawalRecord[]; success: boolean}>(
    ENDPOINTS.DRIVER_WITHDRAWALS,
  );
  return response.data.data ?? (response.data as unknown as WithdrawalRecord[]) ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────

// ─── Active Trip ──────────────────────────────────────────────────────────────

export interface ActiveBookingPayment {
  id: string;
  payment_method: string;
  payment_status: string;
  amount: number;
}

export interface ActiveBooking {
  id: string;
  status: string;
  pickup_address: string;
  drop_address: string;
  estimated_fare: number;
  distance: number | null;
  vehicle_type: string | null;
  customer_id: string;
  driver_earnings: number | null;
  has_toll: boolean;
  toll_amount: number;
  fare_breakdown: Record<string, any> | null;
  // Coordinates (PostGIS GeoJSON)
  pickup_location?: { type: string; coordinates: [number, number] } | any;
  drop_location?: { type: string; coordinates: [number, number] } | any;
  // Payment info
  paid_by: 'sender' | 'receiver';
  is_already_paid: boolean;
  payments?: ActiveBookingPayment[];
  // OTPs
  pickup_otp?: string;
  pickup_otp_verified?: boolean;
  delivery_otp?: string;
  receiver_name?: string;
  receiver_phone?: string;
  alternative_phone?: string;
}

export const getBookingById = async (bookingId: string): Promise<ActiveBooking | null> => {
  try {
    const response = await apiClient.get<{data: ActiveBooking; success: boolean}>(
      ENDPOINTS.GET_BOOKING(bookingId),
    );
    return response.data.data ?? (response.data as unknown as ActiveBooking) ?? null;
  } catch {
    return null;
  }
};

export const getDriverActiveBooking = async (): Promise<ActiveBooking | null> => {
  try {
    const response = await apiClient.get<{data: ActiveBooking; success: boolean}>(
      ENDPOINTS.DRIVER_ACTIVE_BOOKING,
    );
    return response.data.data ?? (response.data as unknown as ActiveBooking) ?? null;
  } catch {
    return null;
  }
};

export const startTrip = async (bookingId: string, pickupOtp: string): Promise<void> => {
  await apiClient.put(ENDPOINTS.START_TRIP(bookingId), { pickup_otp: pickupOtp });
};

export interface CompleteTripPayload {
  delivery_otp: string;
  payment_method?: 'cash' | 'online';
  has_toll?: boolean;
  toll_amount?: number;
  waiting_time_minutes?: number;
}

export interface CompleteTripResult {
  id: string;
  status: string;
  final_fare: number;
  fare_summary: {
    estimated_fare: number;
    waiting_charge: number;
    toll_amount: number;
    final_fare: number;
    skido_commission: number;
    driver_earnings: number;
  };
  coins_earned?: number;
}

export const completeTrip = async (
  bookingId: string,
  payload: CompleteTripPayload = {},
): Promise<CompleteTripResult> => {
  const response = await apiClient.put<{data: CompleteTripResult; success: boolean}>(
    ENDPOINTS.COMPLETE_TRIP(bookingId),
    payload,
  );
  return response.data.data ?? (response.data as unknown as CompleteTripResult);
};

// ─────────────────────────────────────────────────────────────────────────────

/** Returns null on success, or an error message string on failure */
export const rejectBooking = async (bookingId: string): Promise<string | null> => {
  try {
    await apiClient.put<{success: boolean; message?: string}>(
      ENDPOINTS.REJECT_BOOKING(bookingId),
    );
    return null;
  } catch (error: any) {
    const msg: string =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to reject booking.';
    console.error(`[DriverService] Reject booking ${bookingId} failed:`, msg);
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
};
