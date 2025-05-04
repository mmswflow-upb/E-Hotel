// routes/hotelRoutes.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const hotelCtrl = require("../controllers/hotelController");
const roomRoutes = require("./roomRoutes");
const bookingRoutes = require("./bookingRoutes");
const checkRoutes = require("./checkRoutes");
const statRoutes = require("./statRoutes");

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Middleware to merge hotelId into request object for nested routes
router.param("hotelId", (req, res, next, hotelId) => {
  req.hotelId = hotelId;
  next();
});

// List hotels with role-based access
router.get("/", async (req, res) => {
  try {
    const userRole = req.user.role;
    switch (userRole) {
      case "SystemAdmin":
        return await hotelCtrl.listAll(req, res);
      case "HotelManager":
        return await hotelCtrl.listManaged(req, res);
      case "Receptionist":
        return await hotelCtrl.listAssigned(req, res);
      case "Customer":
        return await hotelCtrl.listAll(req, res);
      default:
        return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get single hotel by ID
router.get("/:hotelId", async (req, res) => {
  try {
    await hotelCtrl.getHotelById(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Create hotel - SystemAdmin only
router.post("/", role("SystemAdmin"), async (req, res) => {
  try {
    await hotelCtrl.create(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Hotel-scoped routes
router.use("/:hotelId/rooms", roomRoutes);
router.use("/:hotelId/bookings", bookingRoutes);
router.use("/:hotelId/bookings", checkRoutes);
router.use("/:hotelId/stats", statRoutes);

module.exports = router;
