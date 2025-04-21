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
router.get("/", (req, res, next) => {
  const userRole = req.user?.role;

  if (!userRole) {
    // Public access - return basic hotel info
    return hotelCtrl.listPublic(req, res, next);
  }

  switch (userRole) {
    case "SystemAdmin":
      return hotelCtrl.listAll(req, res, next);
    case "HotelManager":
      return hotelCtrl.listManaged(req, res, next);
    case "Receptionist":
      return hotelCtrl.listAssigned(req, res, next);
    case "Customer":
      return hotelCtrl.listPublic(req, res, next);
    default:
      return hotelCtrl.listPublic(req, res, next);
  }
});

// Protected routes
router.use(auth);

// Create hotel - SystemAdmin only
router.post("/", role("SystemAdmin"), hotelCtrl.create);

// Hotel-scoped routes
router.use("/:hotelId/rooms", roomsR);
router.use("/:hotelId/bookings", bookingsR);
router.use("/:hotelId/bookings", checkR);
router.use("/:hotelId/stats", statsR);

module.exports = router;
