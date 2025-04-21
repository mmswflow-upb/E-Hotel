const router = require("express").Router();
const ctl = require("../controllers/hotelManagerController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Apply auth middleware to all routes
router.use(auth);

// Individual routes with role checks
router.get("/me", role("HotelManager", "SystemAdmin"), ctl.getMe);
router.put("/me", role("HotelManager", "SystemAdmin"), ctl.upsertMe);
router.get(
  "/:hotelId/stats/monthly",
  role("HotelManager", "SystemAdmin"),
  ctl.getMonthlyStats
);
router.patch("/:hotelId", role("HotelManager", "SystemAdmin"), ctl.patchHotel);

module.exports = router;
