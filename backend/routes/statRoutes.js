// routes/stats.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const statsCtrl = require("../controllers/statsController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// monthly report
router.get("/monthly", role("HotelManager"), async (req, res) => {
  try {
    await statsCtrl.monthly(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
