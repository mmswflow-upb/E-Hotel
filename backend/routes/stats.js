// routes/stats.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const statsCtrl = require("../controllers/statsController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// monthly report
router.get("/monthly", role("HotelManager"), statsCtrl.monthly);

module.exports = router;
