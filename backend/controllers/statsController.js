// controllers/statsController.js
const statsSvc = require("../services/statsService");

exports.monthly = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);

    if (isNaN(year) || isNaN(month)) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const rpt = await statsSvc.monthlyStats(req.params.hotelId, year, month);
    if (!rpt) {
      return res
        .status(404)
        .json({ error: "No statistics found for the specified period" });
    }
    res.json(rpt);
  } catch (e) {
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};
