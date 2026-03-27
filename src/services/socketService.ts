import {io, Socket} from 'socket.io-client';
import {API_BASE_URL} from '../config/api.config';

let socket: Socket | null = null;
let bookingOfferCallback: ((offer: BookingOffer) => void) | null = null;
let bookingOfferHandler: ((offer: unknown) => void) | null = null;
let offerExpiredCallback: ((bookingId: string) => void) | null = null;
let offerExpiredHandler: ((data: unknown) => void) | null = null;
let noDriversCallback: ((bookingId: string) => void) | null = null;
let noDriversHandler: ((data: unknown) => void) | null = null;
let bookingAvailableCallback: ((offer: BookingOffer) => void) | null = null;
let bookingAvailableHandler: ((data: unknown) => void) | null = null;
let bookingTakenCallback: ((bookingId: string) => void) | null = null;
let bookingTakenHandler: ((data: unknown) => void) | null = null;
let newNotificationCallback:
  | ((notification: DriverNotification) => void)
  | null = null;
let newNotificationHandler: ((data: unknown) => void) | null = null;

export interface DriverNotification {
  id: string;
  type: 'approval' | 'rejection' | 'payment' | 'weekly_earnings' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: number;
  read: boolean;
}

const BOOKING_OFFER_EVENTS = [
  'booking_offer',
  'booking-offer',
  'new_booking_offer',
] as const;

export interface BookingOffer {
  bookingId: string;
  pickup: string;
  drop: string;
  fare: number;
  distance: number;
  timeLeft: number;
  vehicleType?: string;
  paid_by: 'sender' | 'receiver';
}

const getAddress = (value: unknown): string => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null && 'address' in value) {
    const address = (value as {address?: unknown}).address;
    return typeof address === 'string' ? address : '';
  }
  return '';
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeBookingOffer = (raw: unknown): BookingOffer | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const payload = raw as Record<string, unknown>;
  const bookingId = payload.bookingId ?? payload.booking_id ?? payload.id;

  if (!bookingId || typeof bookingId !== 'string') {
    return null;
  }

  const vehicleType =
    typeof payload.vehicleType === 'string'
      ? payload.vehicleType
      : typeof payload.vehicle_type === 'string'
      ? payload.vehicle_type
      : undefined;

  const paidBy = (payload.paid_by === 'receiver' ? 'receiver' : 'sender') as 'sender' | 'receiver';

  return {
    bookingId,
    pickup: getAddress(payload.pickup ?? payload.pickup_location),
    drop: getAddress(
      payload.drop ??
        payload.dropoff ??
        payload.drop_location ??
        payload.dropoff_location,
    ),
    fare: toNumber(payload.fare ?? payload.estimated_price ?? payload.price),
    distance: toNumber(payload.distance ?? payload.distance_km),
    timeLeft: toNumber(
      payload.timeLeft ?? payload.time_left ?? payload.expires_in,
    ),
    vehicleType,
    paid_by: paidBy,
  };
};

const detachBookingListeners = () => {
  if (!socket || !bookingOfferHandler) {
    return;
  }
  BOOKING_OFFER_EVENTS.forEach(eventName => {
    socket?.off(eventName, bookingOfferHandler!);
  });
  bookingOfferHandler = null;
};

const attachBookingListeners = () => {
  if (!socket || !bookingOfferCallback) {
    return;
  }

  detachBookingListeners();

  bookingOfferHandler = rawOffer => {
    const normalized = normalizeBookingOffer(rawOffer);
    if (!normalized) {
      console.warn(
        '[SocketService] Ignored booking offer with invalid payload:',
        rawOffer,
      );
      return;
    }
    console.log(
      '[SocketService] Received booking offer:',
      normalized.bookingId,
    );
    bookingOfferCallback?.(normalized);
  };

  BOOKING_OFFER_EVENTS.forEach(eventName => {
    socket?.on(eventName, bookingOfferHandler!);
  });
};

const detachExpiredListener = () => {
  if (!socket || !offerExpiredHandler) {
    return;
  }
  socket.off('offer_expired', offerExpiredHandler);
  offerExpiredHandler = null;
};

const attachExpiredListener = () => {
  const cb = offerExpiredCallback;
  if (!socket || cb === null) {
    return;
  }
  detachExpiredListener();
  offerExpiredHandler = (raw: unknown) => {
    const data = (raw ?? {}) as Record<string, unknown>;
    const id =
      typeof data.bookingId === 'string'
        ? data.bookingId
        : typeof data.booking_id === 'string'
        ? data.booking_id
        : '';
    if (id) {
      cb(id);
    }
  };
  socket.on('offer_expired', offerExpiredHandler);
};

const detachNoDriversListener = () => {
  if (!socket || !noDriversHandler) {
    return;
  }
  socket.off('no_drivers_found', noDriversHandler);
  noDriversHandler = null;
};

const attachNoDriversListener = () => {
  const cb = noDriversCallback;
  if (!socket || cb === null) {
    return;
  }
  detachNoDriversListener();
  noDriversHandler = (raw: unknown) => {
    const data = (raw ?? {}) as Record<string, unknown>;
    const id =
      typeof data.bookingId === 'string'
        ? data.bookingId
        : typeof data.booking_id === 'string'
        ? data.booking_id
        : '';
    if (id) {
      cb(id);
    }
  };
  socket.on('no_drivers_found', noDriversHandler);
};

// Top-level handler (not a closure) so TypeScript resolves bookingAvailableCallback
// at call-time without inheriting the outer function's narrowing state.
// Top-level handler (not a closure) so TypeScript resolves bookingAvailableCallback
// at call-time without inheriting the outer function's narrowing state.
function handleBookingAvailableEvent(raw: unknown): void {
  const normalized = normalizeBookingOffer(raw);
  if (!normalized) {
    return;
  }
  bookingAvailableCallback?.(normalized);
}

const detachBookingAvailableListener = () => {
  if (!socket || !bookingAvailableHandler) {
    return;
  }
  socket.off('booking_available', bookingAvailableHandler);
  bookingAvailableHandler = null;
};

const attachBookingAvailableListener = () => {
  if (!socket || !bookingAvailableCallback) {
    return;
  }
  detachBookingAvailableListener();
  bookingAvailableHandler = handleBookingAvailableEvent;
  socket.on('booking_available', bookingAvailableHandler);
};

const detachBookingTakenListener = () => {
  if (!socket || !bookingTakenHandler) {
    return;
  }
  socket.off('booking_taken', bookingTakenHandler);
  bookingTakenHandler = null;
};

function handleBookingTakenEvent(raw: unknown): void {
  const data = (raw ?? {}) as Record<string, unknown>;
  const id =
    typeof data.bookingId === 'string'
      ? data.bookingId
      : typeof data.booking_id === 'string'
      ? data.booking_id
      : '';
  if (id) {
    bookingTakenCallback?.(id);
  }
}

const attachBookingTakenListener = () => {
  if (!socket || !bookingTakenCallback) {
    return;
  }
  detachBookingTakenListener();
  bookingTakenHandler = handleBookingTakenEvent;
  socket.on('booking_taken', bookingTakenHandler);
};

function handleNewNotificationEvent(raw: unknown): void {
  if (!raw || typeof raw !== 'object') {
    return;
  }
  newNotificationCallback?.(raw as DriverNotification);
}

const detachNewNotificationListener = () => {
  if (!socket || !newNotificationHandler) {
    return;
  }
  socket.off('new_notification', newNotificationHandler);
  newNotificationHandler = null;
};

const attachNewNotificationListener = () => {
  if (!socket || !newNotificationCallback) {
    return;
  }
  detachNewNotificationListener();
  newNotificationHandler = handleNewNotificationEvent;
  socket.on('new_notification', newNotificationHandler);
};

export const connectSocket = (token: string) => {
  if (socket) {
    socket.auth = {
      token: `Bearer ${token}`,
    };
    if (!socket.connected) {
      console.log('[SocketService] Reconnecting existing socket...');
      socket.connect();
    } else {
      console.log('[SocketService] Socket already connected.');
    }
    attachBookingListeners();
    attachExpiredListener();
    attachNoDriversListener();
    attachBookingAvailableListener();
    attachBookingTakenListener();
    attachNewNotificationListener();
    return;
  }

  // The domain is the base URL without /api
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const socketUrl = `${origin}/booking`;

  console.log(`[SocketService] Connecting to ${socketUrl}...`);

  socket = io(socketUrl, {
    path: '/socket.io',
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log(
      '[SocketService] Successfully connected to server:',
      socket?.id,
    );
    attachBookingListeners();
    attachExpiredListener();
    attachNoDriversListener();
    attachBookingAvailableListener();
    attachBookingTakenListener();
    attachNewNotificationListener();
  });

  socket.on('connect_error', error => {
    console.error('[SocketService] Connection error:', error);
  });

  socket.on('disconnect', reason => {
    console.log('[SocketService] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('[SocketService] Disconnecting socket...');
    detachBookingListeners();
    detachExpiredListener();
    detachNoDriversListener();
    detachBookingAvailableListener();
    detachBookingTakenListener();
    detachNewNotificationListener();
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const onBookingOffer = (callback: (offer: BookingOffer) => void) => {
  bookingOfferCallback = callback;
  attachBookingListeners();
};

export const offBookingOffer = () => {
  bookingOfferCallback = null;
  detachBookingListeners();
};

export const onOfferExpired = (callback: (bookingId: string) => void) => {
  offerExpiredCallback = callback;
  attachExpiredListener();
};

export const offOfferExpired = () => {
  offerExpiredCallback = null;
  detachExpiredListener();
};

export const onNoDriversFound = (callback: (bookingId: string) => void) => {
  noDriversCallback = callback;
  attachNoDriversListener();
};

export const offNoDriversFound = () => {
  noDriversCallback = null;
  detachNoDriversListener();
};

export const onBookingAvailable = (callback: (offer: BookingOffer) => void) => {
  bookingAvailableCallback = callback;
  attachBookingAvailableListener();
};

export const offBookingAvailable = () => {
  bookingAvailableCallback = null;
  detachBookingAvailableListener();
};

export const onBookingTaken = (callback: (bookingId: string) => void) => {
  bookingTakenCallback = callback;
  attachBookingTakenListener();
};

export const offBookingTaken = () => {
  bookingTakenCallback = null;
  detachBookingTakenListener();
};

export const onNewNotification = (
  callback: (notification: DriverNotification) => void,
) => {
  newNotificationCallback = callback;
  attachNewNotificationListener();
};

export const offNewNotification = () => {
  newNotificationCallback = null;
  detachNewNotificationListener();
};
