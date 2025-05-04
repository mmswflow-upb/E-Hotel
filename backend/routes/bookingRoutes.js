// routes/bookings.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const bookingCtrl = require("../controllers/bookingController");
const invoiceCtrl = require("../controllers/invoiceController");

const router = express.Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(auth);

// Unified booking routes that handle role-based access
router.get(
  "/",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      const userRole = req.user.role;
      switch (userRole) {
        case "Customer":
          return await bookingCtrl.listAllMine(req, res);
        case "Receptionist":
        case "HotelManager":
          return await bookingCtrl.listAll(req, res);
        default:
          return res.status(403).json({ error: "Unauthorized role" });
      }
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.get(
  "/:bookingId",
  role("Customer", "Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      const userRole = req.user.role;
      switch (userRole) {
        case "Customer":
          return await bookingCtrl.getByIdMine(req, res);
        case "Receptionist":
        case "HotelManager":
          return await bookingCtrl.getById(req, res);
        default:
          return res.status(403).json({ error: "Unauthorized role" });
      }
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Create booking route
router.post("/", role("Customer", "Receptionist"), async (req, res) => {
  try {
    const userRole = req.user.role;
    switch (userRole) {
      case "Customer":
        return await bookingCtrl.createCustomer(req, res);
      case "Receptionist":
        return await bookingCtrl.createReceptionist(req, res);
      default:
        return res.status(403).json({ error: "Unauthorized role" });
    }
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post(
  "/:bookingId/cancel",
  role("Customer", "Receptionist"),
  async (req, res) => {
    try {
      const userRole = req.user.role;
      switch (userRole) {
        case "Customer":
          return await bookingCtrl.cancelCustomer(req, res);
        case "Receptionist":
          return await bookingCtrl.cancelReceptionist(req, res);
        default:
          return res.status(403).json({ error: "Unauthorized role" });
      }
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Check-in route (only for receptionists)
router.post("/:bookingId/checkin", role("Receptionist"), async (req, res) => {
  try {
    await bookingCtrl.checkInBooking(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Check-out route (only for receptionists)
router.post("/:bookingId/checkout", role("Receptionist"), async (req, res) => {
  try {
    await bookingCtrl.checkOutBooking(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

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
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

module.exports = router;
