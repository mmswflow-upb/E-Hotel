const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const customerCtrl = require("../controllers/customerController");
const hotelManagerCtrl = require("../controllers/hotelManagerController");
const receptionistCtrl = require("../controllers/receptionistController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Unified profile routes that redirect to appropriate controller based on role
router.get(
  "/me",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  (req, res, next) => {
    const userRole = req.user.role;

    switch (userRole) {
      case "Customer":
        return customerCtrl.getMe(req, res, next);
      case "HotelManager":
        return hotelManagerCtrl.getMe(req, res, next);
      case "Receptionist":
        return receptionistCtrl.getMe(req, res, next);
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }
  }
);

router.put(
  "/me",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  (req, res, next) => {
    const userRole = req.user.role;

    switch (userRole) {
      case "Customer":
        return customerCtrl.updateMe(req, res, next);
      case "HotelManager":
        return hotelManagerCtrl.upsertMe(req, res, next);
      case "Receptionist":
        return receptionistCtrl.upsertMe(req, res, next);
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }
  }
);

module.exports = router;
