const { Server } = require("socket.io");

// Create a new Socket.IO server
const io = new Server(3000, {
    cors: {
        origin: "*", // Allow connections from any origin
    },
});

// Handle incoming connections
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    // Handle initial state
    socket.on("initialState", (data) => {
        console.log("Received initial state:", data);
        // Broadcast the initial state to all clients
        io.emit("initialState", data);
    });

    // Handle position updates
    socket.on("updatePosition", (position) => {
        console.log("Received position update:", position);
        // Broadcast the position update to all clients
        io.emit("positionUpdated", position);
    });

    // Handle rotation updates
    socket.on("updateRotation", (rotation) => {
        console.log("Received rotation update:", rotation);
        // Broadcast the rotation update to all clients
        io.emit("rotationUpdated", rotation);
    });

    // Handle geometry updates
    socket.on("updateGeometry", (geometry) => {
        console.log("Received geometry update:", geometry);
        // Broadcast the geometry update to all clients
        io.emit("geometryUpdated", geometry);
    });

    // Handle color updates
    socket.on("updateColor", (color) => {
        console.log("Received color update:", color);
        // Broadcast the color update to all clients
        io.emit("colorUpdated", color);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A client disconnected:", socket.id);
    });
});

console.log("Socket.IO server is running on http://localhost:3000");
