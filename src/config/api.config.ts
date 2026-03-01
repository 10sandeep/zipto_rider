/**
 * ============================================================
 * API CONFIGURATION
 * Zipto Rider App — Production API Settings
 * ============================================================
 */

export const API_BASE_URL = 'https://api.ridezipto.com/api';

export const API_TIMEOUT = 15000; // 15 seconds

/** All API endpoint paths */
export const ENDPOINTS = {
  // Auth
  DRIVER_REGISTER: '/auth/driver/register', // POST — send OTP (register & login)
  VERIFY_OTP: '/auth/verify-otp',           // POST — verify OTP
  REFRESH_TOKEN: '/auth/refresh-token',     // POST — refresh access token
  VERIFICATION_STATUS: '/driver/verification-status', // GET — check status
  DRIVER_PROFILE: '/driver/profile',        // GET — get driver profile
  DRIVER_TRIPS: '/driver/trips',            // GET — get driver trips
  DAILY_STATS: '/driver/daily-stats',       // GET — get driver daily stats
  DRIVER_AVAILABILITY: '/driver/availability', // PUT — update driver availability
  DRIVER_LOCATION: '/driver/location',      // PUT — update driver location

  // Onboarding
  DRIVER_ONBOARD: '/driver/onboard',        // POST — multipart/form-data

  // Vehicles
  MY_VEHICLES: '/vehicle/my-vehicles',      // GET — get driver's listed vehicles

  // Ratings
  GET_DRIVER_RATING: (driverId: string) => `/rating/driver/${driverId}`, // GET - get driver's ratings

  // Bookings
  ACCEPT_BOOKING: (bookingId: string) => `/booking/${bookingId}/accept`, // PUT - accept booking
} as const;

export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LENGTH = 6;
