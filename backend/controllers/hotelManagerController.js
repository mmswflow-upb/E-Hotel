const svc = require("../services/hotelManagerService");

exports.getMe = async (req, res) => {
  try {
    const data = await svc.getManager(req.user.uid);
    res.json(data || {});
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.upsertMe = async (req, res) => {
  try {
    const saved = await svc.upsertManager(req.user.uid, req.body);
    res.json(saved);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { year, month } = req.query;
    const stats = await svc.monthlyStats(hotelId, year, month);
    if (!stats) return res.status(404).json({ error: "No stats found" });
    res.json(stats);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.patchHotel = async (req, res) => {
  try {
    const hotel = await svc.updateHotel(req.params.hotelId, req.body);
    res.json(hotel);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};
