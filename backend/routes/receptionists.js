const router = require("express").Router();
const ctl = require("../controllers/receptionistController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Apply auth middleware to all routes
router.use(auth);

// Individual routes with role checks
router.get("/me", role("Receptionist", "SystemAdmin"), ctl.getMe);
router.put("/me", role("Receptionist", "SystemAdmin"), ctl.upsertMe);
router.post(
  "/hotels/:hotelId/bookings",
  role("Receptionist", "SystemAdmin"),
  ctl.createBooking
);
router.post(
  "/bookings/:bookingId/cancel",
  role("Receptionist", "SystemAdmin"),
  ctl.cancel
);
router.post(
  "/bookings/:bookingId/checkin",
  role("Receptionist", "SystemAdmin"),
  ctl.checkIn
);
router.post(
  "/bookings/:bookingId/checkout",
  role("Receptionist", "SystemAdmin"),
  ctl.checkOut
);

module.exports = router;
