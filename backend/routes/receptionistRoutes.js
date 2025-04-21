const router = require("express").Router();
const ctl = require("../controllers/receptionistController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Apply auth middleware to all routes
router.use(auth);

// Individual routes with role checks
router.post(
  "/hotels/:hotelId/bookings",
  role("Receptionist", "SystemAdmin"),
  ctl.createBooking
);

router.post(
  "/bookings/:bookingId/checkin",
  role("Receptionist", "SystemAdmin"),
  ctl.checkIn
);

module.exports = router;
