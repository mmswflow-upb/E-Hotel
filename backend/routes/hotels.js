// routes/hotels.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const hotelCtrl = require("../controllers/hotelController");
const roomsR = require("./rooms");
const bookingsR = require("./bookings");
const checkR = require("./check");
const statsR = require("./stats");

const router = express.Router();

// Public routes - anyone can view hotels and rooms
router.get("/", role(), hotelCtrl.list);
router.use("/:hotelId/rooms", roomsR);

// Protected routes
router.use(auth);

// SystemAdmin manages hotels
router.post("/", role("SystemAdmin"), hotelCtrl.create);

// Protected hotel-scoped routes
router.use("/:hotelId/bookings", bookingsR);
router.use("/:hotelId/bookings", checkR);
router.use("/:hotelId/stats", statsR);

module.exports = router;
