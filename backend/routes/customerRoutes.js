// routes/customers.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const custCtrl = require("../controllers/customerController");
const customerService = require("../services/customerService");

const router = express.Router();

// all routes require a valid JWT
router.use(auth);

// Staff/SystemAdmin can list or fetch any customer
router.get(
  "/",
  role("Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await custCtrl.list(req, res);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Get customer details by ID
router.get(
  "/:customerId",
  role("Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      const customer = await customerService.getCustomer(req.params.customerId);
      if (customer.error) {
        return res.status(404).json({ error: customer.error });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
