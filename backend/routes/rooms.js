// routes/rooms.js
const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const roomCtrl = require("../controllers/roomController");

const router = express.Router({ mergeParams: true });
router.use(auth);

// Everyone with access to this hotel can view rooms
router.get(
  "/",
  role("Tourist", "Receptionist", "HotelManager", "SystemAdmin"),
  roomCtrl.list
);
// HotelManager / SystemAdmin can add rooms
router.post("/", role("HotelManager", "SystemAdmin"), roomCtrl.create);

module.exports = router;
