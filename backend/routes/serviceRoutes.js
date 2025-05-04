const express = require("express");
const router = express.Router();
const ServiceController = require("../controllers/serviceController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const role = require("../middleware/role");

// Get all services
router.get("/", authenticateToken, async (req, res) => {
  try {
    const services = await ServiceController.getAllServices();
    res.json(services);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
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
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
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
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
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
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
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
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Create service - HotelManager/SystemAdmin only
router.post("/", role("HotelManager", "SystemAdmin"), async (req, res) => {
  try {
    await ServiceController.create(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Update service - HotelManager/SystemAdmin only
router.put(
  "/:serviceID",
  role("HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await ServiceController.update(req, res);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Delete service - HotelManager/SystemAdmin only
router.delete(
  "/:serviceID",
  role("HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await ServiceController.delete(req, res);
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
