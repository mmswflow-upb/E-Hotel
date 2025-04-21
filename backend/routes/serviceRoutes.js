const express = require("express");
const router = express.Router();
const ServiceController = require("../controllers/serviceController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Get all services
router.get("/", authenticateToken, async (req, res) => {
  try {
    const services = await ServiceController.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service by ID
router.get("/:serviceID", authenticateToken, async (req, res) => {
  try {
    const service = await ServiceController.getServiceById(
      req.params.serviceID
    );
    res.json(service);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create new service (admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Admin"]),
  async (req, res) => {
    try {
      const service = await ServiceController.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Update service (admin only)
router.put(
  "/:serviceID",
  authenticateToken,
  authorizeRole(["Admin"]),
  async (req, res) => {
    try {
      const service = await ServiceController.updateService(
        req.params.serviceID,
        req.body
      );
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete service (admin only)
router.delete(
  "/:serviceID",
  authenticateToken,
  authorizeRole(["Admin"]),
  async (req, res) => {
    try {
      const result = await ServiceController.deleteService(
        req.params.serviceID
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
