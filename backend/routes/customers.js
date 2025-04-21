// routes/customers.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const custCtrl = require("../controllers/customerController");

const router = express.Router();

// all routes require a valid JWT
router.use(auth);

// Tourist can view/update their own profile
router.get("/me", role("Tourist"), custCtrl.getMe);
router.put("/me", role("Tourist"), custCtrl.updateMe);

// Staff/SystemAdmin can list or fetch any customer
router.get(
  "/",
  role("Receptionist", "HotelManager", "SystemAdmin"),
  custCtrl.list
);
router.get(
  "/:customerID",
  role("Receptionist", "HotelManager", "SystemAdmin"),
  custCtrl.getById
);

module.exports = router;
