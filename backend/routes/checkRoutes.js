// routes/check.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const chkCtrl = require("../controllers/checkController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// check‑in
router.post("/:bookingId/checkin", role("Receptionist"), chkCtrl.checkIn);
// check‑out
router.post("/:bookingId/checkout", role("Receptionist"), chkCtrl.checkOut);

module.exports = router;
