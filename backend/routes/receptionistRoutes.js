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
  async (req, res) => {
    try {
      await ctl.createBooking(req, res);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.post(
  "/bookings/:bookingId/checkin",
  role("Receptionist", "SystemAdmin"),
  async (req, res) => {
    try {
      await ctl.checkIn(req, res);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

module.exports = router;
