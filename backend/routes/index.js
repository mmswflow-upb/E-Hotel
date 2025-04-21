// routes/index.js
const express = require("express");
const hotelsR = require("../routes/hotels");
const customersR = require("../routes/customers");
const bookingsR = require("../routes/bookings");

const router = express.Router();

router.use("/hotels", hotelsR);
router.use("/customers", customersR);
router.use("/bookings", bookingsR);

module.exports = router;
