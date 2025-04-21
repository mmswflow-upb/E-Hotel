// routes/bookings.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const bkgCtrl = require("../controllers/bookingController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// Top-level routes (no hotelId required)
router.get("/mine", role("Tourist", "Customer"), bkgCtrl.listAllMine);

// Hotel-specific routes (requires hotelId)
router.post("/", role("Tourist", "Customer", "Receptionist"), bkgCtrl.create);
router.get("/", role("Receptionist", "HotelManager"), bkgCtrl.listAll);
router.post(
  "/:bookingId/cancel",
  role("Tourist", "Customer", "Receptionist"),
  bkgCtrl.cancel
);

module.exports = router;
