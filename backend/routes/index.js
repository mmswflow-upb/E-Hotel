// routes/index.js
const express = require("express");
const hotelsR = require("../routes/hotels");
const customersR = require("../routes/customers");
const bookingsR = require("../routes/bookings");
const managersR = require("../routes/hotelManagers");
const receptionistsR = require("../routes/receptionists");
const accountsR = require("../routes/accounts");

const router = express.Router();

router.use("/hotels", hotelsR);
router.use("/customers", customersR);
router.use("/bookings", bookingsR);
router.use("/managers", managersR);
router.use("/receptionists", receptionistsR);
router.use("/accounts", accountsR);

module.exports = router;
