// routes/rooms.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const roomCtrl = require("../controllers/roomController");

const router = express.Router({ mergeParams: true });

// Public routes
router.get("/", role(), roomCtrl.list);

// Protected routes
router.use(auth);

// HotelManager / SystemAdmin can add rooms
router.post("/", role("HotelManager", "SystemAdmin"), roomCtrl.create);

module.exports = router;
