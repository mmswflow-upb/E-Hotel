// backend/server.js
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Firebase Admin SDK with your service account
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace <your-project-id> with your actual Firebase project ID.
  databaseURL: "https://<your-project-id>.firebaseio.com",
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Middleware: Verify Firebase token from the Authorization header
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(403).send("Unauthorized");
  }
  const token = header.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    if (!req.user.role) req.user.role = "tourist"; // Default role
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).send("Unauthorized");
  }
};

// Middleware: Role checking middleware
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send("Forbidden: Insufficient role");
  }
  next();
};

// API Endpoints

// POST /api/reservations – Create a new reservation (tourist only)
app.post(
  "/api/reservations",
  authenticate,
  requireRole(["tourist"]),
  async (req, res) => {
    try {
      const { roomType, checkInDate, checkOutDate } = req.body;
      if (!roomType || !checkInDate || !checkOutDate) {
        return res.status(400).send("Missing required reservation data");
      }
      const newReservation = {
        touristId: req.user.uid,
        roomType,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        status: "booked", // Possible statuses: booked, cancelled, occupied, completed
        createdAt: new Date(),
      };
      const docRef = await db.collection("reservations").add(newReservation);
      res.status(201).send({ reservationId: docRef.id, ...newReservation });
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).send("Server error");
    }
  }
);

// GET /api/reservations – Get reservations (tourists see only their own)
app.get("/api/reservations", authenticate, async (req, res) => {
  try {
    let query;
    if (req.user.role === "tourist") {
      query = db
        .collection("reservations")
        .where("touristId", "==", req.user.uid);
    } else {
      query = db.collection("reservations");
    }
    const snapshot = await query.get();
    const reservations = [];
    snapshot.forEach((doc) => reservations.push({ id: doc.id, ...doc.data() }));
    res.send(reservations);
  } catch (error) {
    console.error("Error retrieving reservations:", error);
    res.status(500).send("Server error");
  }
});

// PUT /api/reservations/:id/cancel – Cancel a reservation (tourist or receptionist)
app.put("/api/reservations/:id/cancel", authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservationRef = db.collection("reservations").doc(reservationId);
    const doc = await reservationRef.get();
    if (!doc.exists) {
      return res.status(404).send("Reservation not found");
    }
    const reservation = doc.data();
    if (
      req.user.uid !== reservation.touristId &&
      req.user.role !== "receptionist"
    ) {
      return res.status(403).send("Forbidden: Cannot cancel this reservation");
    }
    await reservationRef.update({ status: "cancelled" });
    res.send({ id: reservationId, status: "cancelled" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).send("Server error");
  }
});

// POST /api/checkin – Check in a reservation (receptionist only)
app.post(
  "/api/checkin",
  authenticate,
  requireRole(["receptionist"]),
  async (req, res) => {
    try {
      const { reservationId } = req.body;
      if (!reservationId) {
        return res.status(400).send("Missing reservationId");
      }
      const reservationRef = db.collection("reservations").doc(reservationId);
      const doc = await reservationRef.get();
      if (!doc.exists) {
        return res.status(404).send("Reservation not found");
      }
      const reservation = doc.data();
      if (reservation.status !== "booked") {
        return res.status(400).send("Reservation cannot be checked in");
      }
      await reservationRef.update({
        status: "occupied",
        checkInTime: new Date(),
      });
      res.send({ id: reservationId, status: "occupied" });
    } catch (error) {
      console.error("Error during check-in:", error);
      res.status(500).send("Server error");
    }
  }
);

// POST /api/checkout – Check out a reservation (receptionist only)
app.post(
  "/api/checkout",
  authenticate,
  requireRole(["receptionist"]),
  async (req, res) => {
    try {
      const { reservationId } = req.body;
      if (!reservationId) {
        return res.status(400).send("Missing reservationId");
      }
      const reservationRef = db.collection("reservations").doc(reservationId);
      const doc = await reservationRef.get();
      if (!doc.exists) {
        return res.status(404).send("Reservation not found");
      }
      const reservation = doc.data();
      if (reservation.status !== "occupied") {
        return res.status(400).send("Reservation cannot be checked out");
      }
      await reservationRef.update({
        status: "completed",
        checkOutTime: new Date(),
      });
      res.send({ id: reservationId, status: "completed" });
    } catch (error) {
      console.error("Error during check-out:", error);
      res.status(500).send("Server error");
    }
  }
);

// GET /api/stats – Generate monthly statistics (hotel_manager only)
app.get(
  "/api/stats",
  authenticate,
  requireRole(["hotel_manager"]),
  async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const snapshot = await db
        .collection("reservations")
        .where("createdAt", ">=", startOfMonth)
        .where("createdAt", "<=", endOfMonth)
        .get();
      let total = 0,
        cancelled = 0,
        completed = 0,
        booked = 0;
      snapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        if (data.status === "cancelled") cancelled++;
        if (data.status === "completed") completed++;
        if (data.status === "booked") booked++;
      });
      res.send({
        totalReservations: total,
        cancelled,
        completed,
        booked,
        occupancyRate: total > 0 ? (completed / total) * 100 : 0,
      });
    } catch (error) {
      console.error("Error generating statistics:", error);
      res.status(500).send("Server error");
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
