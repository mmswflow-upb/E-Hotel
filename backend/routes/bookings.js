// routes/bookings.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const bkgCtrl = require("../controllers/bookingController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// make a booking
router.post("/", role("Tourist", "Receptionist"), bkgCtrl.create);
// view own bookings
router.get("/mine", role("Tourist"), bkgCtrl.listMine);
// staff view all
router.get("/", role("Receptionist", "HotelManager"), bkgCtrl.listAll);
// cancel
router.post(
  "/:bookingId/cancel",
  role("Tourist", "Receptionist"),
  bkgCtrl.cancel
);

module.exports = router;
