/**
 * ─────────────────────────────────────────────────────────────
 * LOCAL BOOKING NOTIFICATION TEST
 * ─────────────────────────────────────────────────────────────
 *
 * PURPOSE: Verify the full booking_offer → driver notification
 *          pipeline on your local machine WITHOUT the real
 *          customer booking flow.
 *
 * HOW TO USE:
 *
 *   1. Start the backend:
 *        cd skido-backend && npm run start:dev
 *
 *   2. Log in as a DRIVER in the rider app, go ONLINE
 *      (the app will connect the WebSocket automatically).
 *
 *   3. Get the driver's user ID from the database or
 *      from the backend logs ("Client connected: ... User: <id>").
 *
 *   4. Fill in DRIVER_USER_ID and DRIVER_JWT below, then run:
 *        node test-socket.js
 *
 *   The script does two things in parallel:
 *     a) Connects as the driver via WebSocket — logs every event
 *        so you can confirm the socket room is working.
 *     b) Fires a fake booking_offer via the test HTTP endpoint
 *        so you can see the notification pop up on the phone.
 *
 * ─────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────
// CONFIG — fill these in before running
// ──────────────────────────────────────────────
const BACKEND_URL = 'http://10.218.189.239:3000'; // local backend (same Wi-Fi IP)
const API_PREFIX = '/api'; // matches app.apiPrefix
const DRIVER_USER_ID = 'fe4b9c3e-e26f-441a-b906-7a9633540a6a';
const DRIVER_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTRiOWMzZS1lMjZmLTQ0MWEtYjkwNi03YTk2MzM1NDBhNmEiLCJwaG9uZSI6Iis5MTYzNzExNzE1NTMiLCJyb2xlIjoiZHJpdmVyIiwiaWF0IjoxNzczNTUzODI2LCJleHAiOjE3NzM1NTQ3MjZ9.NDBBMpNzwOzPBjfb5QSFzeDSEasX1EmKi9dAzhWWWN8'; // access_token from login

// Fake offer payload — tweak freely
const FAKE_OFFER = {
  driverId: DRIVER_USER_ID,
  pickup: 'Nayapalli, Bhubaneswar, Odisha',
  drop: 'Esplanade One Mall, Bhubaneswar',
  fare: 120,
  distance: 4.5,
  vehicleType: 'bike',
  timeLeft: 30,
};
// ──────────────────────────────────────────────

const {io} = require('socket.io-client');
const http = require('http');

// ── 1. Connect to the /booking namespace as the driver ────────
const socket = io(`${BACKEND_URL}/booking`, {
  path: '/socket.io',
  auth: {token: `Bearer ${DRIVER_JWT}`},
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('\n✅ WebSocket connected — socket id:', socket.id);
  console.log('   Listening for events on user room: user_' + DRIVER_USER_ID);
  fireTestOffer();
});

socket.on('connect_error', err => {
  console.error('\n❌ WebSocket connect error:', err.message);
  console.error('   Make sure backend is running and DRIVER_JWT is valid.\n');
});

socket.on('booking_offer', data =>
  console.log('\n🔔 [booking_offer]    ', JSON.stringify(data, null, 2)),
);
socket.on('offer_expired', data =>
  console.log('\n⏰ [offer_expired]    ', JSON.stringify(data, null, 2)),
);
socket.on('no_drivers_found', data =>
  console.log('\n🚫 [no_drivers_found] ', JSON.stringify(data, null, 2)),
);
socket.on('booking_accepted', data =>
  console.log('\n✅ [booking_accepted] ', JSON.stringify(data, null, 2)),
);
socket.on('disconnect', reason => console.log('\n🔌 Disconnected:', reason));

// ── 2. Fire the fake offer via the test HTTP endpoint ─────────
function fireTestOffer() {
  const body = JSON.stringify(FAKE_OFFER);
  const url = new URL(`${BACKEND_URL}${API_PREFIX}/booking/test/fire-offer`);

  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  console.log('\n📡 Firing test offer to driver:', DRIVER_USER_ID);

  const req = http.request(options, res => {
    let raw = '';
    res.on('data', chunk => (raw += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(raw);
        console.log('   HTTP response:', JSON.stringify(json, null, 2));
        console.log(
          '\n👀 Check your phone — the notification should appear now!\n',
        );
      } catch {
        console.log('   Raw response:', raw);
      }
    });
  });

  req.on('error', err => console.error('❌ HTTP error:', err.message));
  req.write(body);
  req.end();
}
