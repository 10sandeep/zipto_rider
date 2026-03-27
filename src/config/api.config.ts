/**
 * ============================================================
 * API CONFIGURATION
 * Zipto Rider App — Production API Settings
 * ============================================================
 *
 * LOCAL TESTING:
 *   Replace API_BASE_URL with your machine's LAN IP so the
 *   physical device can reach it (localhost won't work on phone).
 *
 *   Find your IP:  Windows → ipconfig   |   Mac/Linux → ifconfig
 *   Then set:      'http://192.168.x.x:3000/api'
 * ============================================================
 */

// export const API_BASE_URL = 'http://10.186.92.239:3000/api';   // ← LOCAL DEV
export const API_BASE_URL = 'https://api.ridezipto.com/api'; // ← PRODUCTION

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
  REJECT_BOOKING: (bookingId: string) => `/booking/${bookingId}/reject`, // PUT - reject booking
  START_TRIP: (bookingId: string) => `/booking/${bookingId}/start`,      // PUT - start trip
  COMPLETE_TRIP: (bookingId: string) => `/booking/${bookingId}/complete`,// PUT - complete trip (toll, waiting)
  AVAILABLE_BOOKINGS: '/booking/available',                              // GET - broadcast bookings near driver
  DRIVER_ACTIVE_BOOKING: '/booking/driver/active',                       // GET - driver's current active booking

  // Calendar / Attendance
  DRIVER_CALENDAR: '/driver/calendar',        // GET  - driver calendar with earnings per day

  // Bank Accounts
  BANK_ACCOUNTS: '/driver/bank-accounts',                              // GET, POST
  BANK_ACCOUNT: (id: string) => `/driver/bank-accounts/${id}`,         // PUT, DELETE
  BANK_ACCOUNT_PRIMARY: (id: string) => `/driver/bank-accounts/${id}/primary`, // PUT

  // Notifications
  GET_NOTIFICATIONS: '/notification',         // GET  - get driver notifications
  MARK_NOTIFICATIONS_READ: '/notification/read-all', // POST - mark all as read
  CLEAR_NOTIFICATIONS: '/notification/clear', // DELETE - clear all notifications

  // Earnings & Withdrawals
  DRIVER_EARNINGS: '/driver/earnings',                       // GET  ?period=today|week|month
  DRIVER_WITHDRAW: '/driver/earnings/withdraw',              // POST
  DRIVER_WITHDRAWALS: '/driver/earnings/withdrawals',        // GET
} as const;

export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LENGTH = 6;
