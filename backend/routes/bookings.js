// routes/bookings.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const bookingCtrl = require("../controllers/bookingController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Unified booking routes that handle role-based access
router.get(
  "/",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  (req, res, next) => {
    const userRole = req.user.role;

    switch (userRole) {
      case "Customer":
        return bookingCtrl.listAllMine(req, res, next);
      case "Receptionist":
      case "HotelManager":
        return bookingCtrl.listAll(req, res, next);
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }
  }
);

router.get(
  "/:bookingId",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  (req, res, next) => {
    const userRole = req.user.role;

    switch (userRole) {
      case "Customer":
        return bookingCtrl.getByIdMine(req, res, next);
      case "Receptionist":
      case "HotelManager":
        return bookingCtrl.getById(req, res, next);
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }
  }
);

router.post("/", role("Customer", "Receptionist"), (req, res, next) => {
  const userRole = req.user.role;

  switch (userRole) {
    case "Customer":
      return bookingCtrl.createCustomer(req, res, next);
    case "Receptionist":
      return bookingCtrl.createReceptionist(req, res, next);
    default:
      return res.status(403).json({ message: "Unauthorized role" });
  }
});

router.post(
  "/:bookingId/cancel",
  role("Customer", "Receptionist"),
  (req, res, next) => {
    const userRole = req.user.role;

    switch (userRole) {
      case "Customer":
        return bookingCtrl.cancelCustomer(req, res, next);
      case "Receptionist":
        return bookingCtrl.cancelReceptionist(req, res, next);
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }
  }
);

module.exports = router;
