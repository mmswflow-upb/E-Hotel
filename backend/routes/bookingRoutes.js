// routes/bookings.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const bookingCtrl = require("../controllers/bookingController");
const invoiceCtrl = require("../controllers/invoiceController");

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
        return res.status(403).json({ error: "Unauthorized role" });
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
        return res.status(403).json({ error: "Unauthorized role" });
    }
  }
);

// Create booking route
router.post("/", role("Customer", "Receptionist"), (req, res, next) => {
  const userRole = req.user.role;

  switch (userRole) {
    case "Customer":
      return bookingCtrl.createCustomer(req, res, next);
    case "Receptionist":
      return bookingCtrl.createReceptionist(req, res, next);
    default:
      return res.status(403).json({ error: "Unauthorized role" });
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
        return res.status(403).json({ error: "Unauthorized role" });
    }
  }
);

// Check-in route (only for receptionists)
router.post(
  "/:bookingId/checkin",
  role("Receptionist"),
  bookingCtrl.checkInBooking
);

// Check-out route (only for receptionists)
router.post(
  "/:bookingId/checkout",
  role("Receptionist"),
  bookingCtrl.checkOutBooking
);

// Get invoice for booking
router.get(
  "/:bookingId/invoice",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      const invoices = await invoiceCtrl.getInvoicesByBooking(
        req.params.bookingId
      );
      if (!invoices || invoices.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      // Return the first invoice since a booking should only have one invoice
      res.json(invoices[0]);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

module.exports = router;
