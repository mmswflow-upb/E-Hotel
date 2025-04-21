// routes/index.js
const express = require("express");
const hotelRoutes = require("./hotelRoutes");
const customerRoutes = require("./customerRoutes");
const bookingRoutes = require("./bookingRoutes");
const hotelManagerRoutes = require("./hotelManagerRoutes");
const receptionistRoutes = require("./receptionistRoutes");
const accountRoutes = require("./accountRoutes");
const roomRoutes = require("./roomRoutes");
const statRoutes = require("./statRoutes");
const checkRoutes = require("./checkRoutes");
const invoiceRoutes = require("./invoiceRoutes");

const router = express.Router();

router.use("/hotels", hotelRoutes);
router.use("/customers", customerRoutes);
router.use("/bookings", bookingRoutes);
router.use("/managers", hotelManagerRoutes);
router.use("/receptionists", receptionistRoutes);
router.use("/accounts", accountRoutes);
router.use("/rooms", roomRoutes);
router.use("/stats", statRoutes);
router.use("/check", checkRoutes);
router.use("/invoices", invoiceRoutes);

module.exports = router;
