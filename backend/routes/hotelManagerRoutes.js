const router = require("express").Router();
const ctl = require("../controllers/hotelManagerController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Apply auth middleware to all routes
router.use(auth);

// Individual routes with role checks
router.get(
  "/:hotelId/stats/monthly",
  role("HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await ctl.getMonthlyStats(req, res);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.patch(
  "/:hotelId",
  role("HotelManager", "SystemAdmin"),
  async (req, res) => {
    try {
      await ctl.patchHotel(req, res);
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
