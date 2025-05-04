// routes/customers.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const custCtrl = require("../controllers/customerController");

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

router.get(
  "/:customerID",
  role("Receptionist", "HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await custCtrl.getById(req, res);
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
