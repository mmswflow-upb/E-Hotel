// routes/index.js
const express = require("express");
const hotelsR = require("../routes/hotels");
const customersR = require("../routes/customers");
const bookingsR = require("../routes/bookings");
const managersR = require("../routes/hotelManagers");
const receptionistsR = require("../routes/receptionists");

const router = express.Router();

router.use("/hotels", hotelsR);
router.use("/customers", customersR);
router.use("/bookings", bookingsR);
router.use("/manager", managersR);
router.use("/receptionist", receptionistsR);

module.exports = router;
