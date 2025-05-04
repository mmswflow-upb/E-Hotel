// routes/rooms.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const roomCtrl = require("../controllers/roomController");

const router = express.Router({ mergeParams: true });

// Public routes
router.get("/", role(), async (req, res) => {
  try {
    await roomCtrl.list(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Protected routes
router.use(auth);

// HotelManager / SystemAdmin can add rooms
router.post("/", role("HotelManager", "SystemAdmin"), async (req, res) => {
  try {
    await roomCtrl.create(req, res);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
