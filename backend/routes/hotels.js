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

// Apply auth middleware to all routes
router.use(auth);

// List hotels with role-based access
router.get("/", (req, res, next) => {
  const userRole = req.user.role;

  switch (userRole) {
    case "SystemAdmin":
      return hotelCtrl.listAll(req, res, next);
    case "HotelManager":
      return hotelCtrl.listManaged(req, res, next);
    case "Receptionist":
      return hotelCtrl.listAssigned(req, res, next);
    case "Customer":
      return hotelCtrl.listAll(req, res, next);
    default:
      return res.status(401).json({ error: "Unauthorized" });
  }
});

// Get single hotel by ID
router.get("/:hotelId", hotelCtrl.getHotelById);

// Create hotel - SystemAdmin only
router.post("/", role("SystemAdmin"), hotelCtrl.create);

// Hotel-scoped routes
router.use("/:hotelId/rooms", roomsR);
router.use("/:hotelId/bookings", bookingsR);
router.use("/:hotelId/bookings", checkR);
router.use("/:hotelId/stats", statsR);

module.exports = router;
