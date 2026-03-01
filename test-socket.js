const { Server } = require("socket.io");
const io = new Server(3000, {
  cors: { origin: "*" },
  path: '/socket.io'
});

const bookingNamespace = io.of("/booking");

bookingNamespace.on("connection", (socket) => {
  console.log("Client connected to /booking:", socket.id);
  
  // Send a test offer 5 seconds after connection
  setTimeout(() => {
    console.log("Emitting test booking_offer to", socket.id);
    socket.emit("booking_offer", {
      id: "fake-uuid-1234",
      user_id: "user-999",
      pickup_location: { address: "Test Pickup", latitude: 20.296, longitude: 85.824 },
      dropoff_location: { address: "Test Dropoff", latitude: 20.300, longitude: 85.830 },
      distance_km: 5.5,
      estimated_price: 150,
      status: "pending",
      created_at: new Date().toISOString()
    });
  }, 5000);
});

console.log("Test Socket.IO Server running on port 3000...");
