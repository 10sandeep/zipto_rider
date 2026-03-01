import {io, Socket} from 'socket.io-client';
import {API_BASE_URL} from '../config/api.config';

let socket: Socket | null = null;
let bookingOfferCallback: ((offer: BookingOffer) => void) | null = null;
let bookingOfferHandler: ((offer: unknown) => void) | null = null;

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
