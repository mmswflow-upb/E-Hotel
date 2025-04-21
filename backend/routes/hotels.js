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

router.use(auth);

// SystemAdmin manages hotels
router.post("/", role("SystemAdmin"), hotelCtrl.create);

// nested hotel‑scoped routes
router.get("/", hotelCtrl.list);
router.use("/:hotelId/rooms", roomsR);
router.use("/:hotelId/bookings", bookingsR);
router.use("/:hotelId/bookings", checkR);
router.use("/:hotelId/stats", statsR);

module.exports = router;
