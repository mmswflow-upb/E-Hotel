// routes/check.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const chkCtrl = require("../controllers/checkController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// check‑in
router.post("/:bookingId/checkin", role("Receptionist"), async (req, res) => {
  try {
    await chkCtrl.checkIn(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// check‑out
router.post("/:bookingId/checkout", role("Receptionist"), async (req, res) => {
  try {
    await chkCtrl.checkOut(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
