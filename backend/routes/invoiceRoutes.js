const express = require("express");
const router = express.Router();
const InvoiceController = require("../controllers/invoiceController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Apply auth middleware to all routes
router.use(auth);

// Get invoice by ID
router.get("/:invoiceID", async (req, res) => {
  try {
    const invoice = await InvoiceController.getInvoiceById(
      req.params.invoiceID
    );
    res.json(invoice);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get invoices by booking
router.get("/booking/:bookingID", async (req, res) => {
  try {
    const invoices = await InvoiceController.getInvoicesByBooking(
      req.params.bookingID
    );
    res.json(invoices);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get invoices by hotel (hotel staff only)
router.get(
  "/hotel/:hotelID",
  role(["HotelManager", "Receptionist"]),
  async (req, res) => {
    try {
      const invoices = await InvoiceController.getInvoicesByHotel(
        req.params.hotelID
      );
      res.json(invoices);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Create new invoice (hotel staff only)
router.post("/", role(["HotelManager", "Receptionist"]), async (req, res) => {
  try {
    const invoice = await InvoiceController.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Update invoice (hotel staff only)
router.put(
  "/:invoiceID",
  role(["HotelManager", "Receptionist"]),
  async (req, res) => {
    try {
      const invoice = await InvoiceController.updateInvoice(
        req.params.invoiceID,
        req.body
      );
      res.json(invoice);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Add service to invoice (hotel staff only)
router.post(
  "/:invoiceID/services",
  role(["HotelManager", "Receptionist"]),
  async (req, res) => {
    try {
      const invoice = await InvoiceController.addServiceToInvoice(
        req.params.invoiceID,
        req.body
      );
      res.json(invoice);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Update invoice status (hotel staff only)
router.put(
  "/:invoiceID/status",
  role(["HotelManager", "Receptionist"]),
  async (req, res) => {
    try {
      const invoice = await InvoiceController.updateInvoiceStatus(
        req.params.invoiceID,
        req.body.status
      );
      res.json(invoice);
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
