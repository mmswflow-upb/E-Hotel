// backend/server.js
/* eslint-disable no-console */
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

/* ------------------------------------------------------------------ */
/* 1)  Firebase Admin SDK — use the Application‑Default Credentials   */
/* ------------------------------------------------------------------ */
// Cloud Run automatically supplies credentials for the service account
// you deploy with, so no key file is required. If you deploy with the
// default project service account that has "Cloud Datastore User" (or
// Firestore) permissions, the following single call is enough.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // projectId can be omitted; Admin SDK will infer it from the creds.
  // projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const db = admin.firestore();

/* ------------------------------------------------------------------ */
/* 2)  Express app & middleware                                        */
/* ------------------------------------------------------------------ */
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ───────────────────────── Authentication ──────────────────────────
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const idToken = header.substring(7); // after "Bearer "
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    req.user.role ||= "tourist"; // default role
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).send("Unauthorized");
  }
};

// ────────────────────────── RBAC helper ────────────────────────────
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send("Forbidden: Insufficient role");
  }
  next();
};

/* ------------------------------------------------------------------ */
/* 3)  API routes                                                      */
/* ------------------------------------------------------------------ */

// POST /api/reservations  ─ tourist creates a reservation
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

      const reservation = {
        touristId: req.user.uid,
        roomType,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        status: "booked", // booked | cancelled | occupied | completed
        createdAt: new Date(),
      };

      const docRef = await db.collection("reservations").add(reservation);
      res.status(201).send({ reservationId: docRef.id, ...reservation });
    } catch (err) {
      console.error("Error creating reservation:", err);
      res.status(500).send("Server error");
    }
  }
);

// GET /api/reservations ─ tourist gets own, staff gets all
app.get("/api/reservations", authenticate, async (req, res) => {
  try {
    const query =
      req.user.role === "tourist"
        ? db.collection("reservations").where("touristId", "==", req.user.uid)
        : db.collection("reservations");

    const snap = await query.get();
    const out = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.send(out);
  } catch (err) {
    console.error("Error retrieving reservations:", err);
    res.status(500).send("Server error");
  }
});

// PUT /api/reservations/:id/cancel ─ tourist or receptionist
app.put("/api/reservations/:id/cancel", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const reservationRef = db.collection("reservations").doc(id);
    const doc = await reservationRef.get();
    if (!doc.exists) return res.status(404).send("Reservation not found");

    const reservation = doc.data();
    if (
      req.user.uid !== reservation.touristId &&
      req.user.role !== "receptionist"
    ) {
      return res.status(403).send("Forbidden: Cannot cancel this reservation");
    }
    await reservationRef.update({ status: "cancelled" });
    res.send({ id, status: "cancelled" });
  } catch (err) {
    console.error("Error cancelling reservation:", err);
    res.status(500).send("Server error");
  }
});

// POST /api/checkin ─ receptionist only
app.post(
  "/api/checkin",
  authenticate,
  requireRole(["receptionist"]),
  async (req, res) => {
    try {
      const { reservationId } = req.body;
      if (!reservationId) return res.status(400).send("Missing reservationId");

      const ref = db.collection("reservations").doc(reservationId);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).send("Reservation not found");

      const data = snap.data();
      if (data.status !== "booked") {
        return res.status(400).send("Reservation cannot be checked in");
      }

      await ref.update({ status: "occupied", checkInTime: new Date() });
      res.send({ id: reservationId, status: "occupied" });
    } catch (err) {
      console.error("Error during check‑in:", err);
      res.status(500).send("Server error");
    }
  }
);

// POST /api/checkout ─ receptionist only
app.post(
  "/api/checkout",
  authenticate,
  requireRole(["receptionist"]),
  async (req, res) => {
    try {
      const { reservationId } = req.body;
      if (!reservationId) return res.status(400).send("Missing reservationId");

      const ref = db.collection("reservations").doc(reservationId);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).send("Reservation not found");

      const data = snap.data();
      if (data.status !== "occupied") {
        return res.status(400).send("Reservation cannot be checked out");
      }

      await ref.update({ status: "completed", checkOutTime: new Date() });
      res.send({ id: reservationId, status: "completed" });
    } catch (err) {
      console.error("Error during check‑out:", err);
      res.status(500).send("Server error");
    }
  }
);

// GET /api/stats ─ hotel_manager only
app.get(
  "/api/stats",
  authenticate,
  requireRole(["hotel_manager"]),
  async (_req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const snap = await db
        .collection("reservations")
        .where("createdAt", ">=", startOfMonth)
        .where("createdAt", "<=", endOfMonth)
        .get();

      let total = 0,
        cancelled = 0,
        completed = 0,
        booked = 0;
      snap.forEach((doc) => {
        total++;
        const s = doc.data().status;
        if (s === "cancelled") cancelled++;
        if (s === "completed") completed++;
        if (s === "booked") booked++;
      });

      res.send({
        totalReservations: total,
        cancelled,
        completed,
        booked,
        occupancyRate: total ? (completed / total) * 100 : 0,
      });
    } catch (err) {
      console.error("Error generating statistics:", err);
      res.status(500).send("Server error");
    }
  }
);

/* ------------------------------------------------------------------ */
/* 4)  Health check route — useful for Cloud Run startup probes        */
/* ------------------------------------------------------------------ */
app.get("/health", (_req, res) => res.status(200).send("Healthy"));

/* ------------------------------------------------------------------ */
/* 5)  Start the HTTP server                                           */
/* ------------------------------------------------------------------ */
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Express server listening on port ${PORT}`)
);
