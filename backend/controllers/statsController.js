// controllers/statsController.js
const statsSvc = require("../services/statsService");

exports.monthly = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const rpt = await statsSvc.monthlyStats(req.params.hotelId, year, month);
    res.json(rpt);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
