const svc = require("../services/hotelManagerService");

exports.getMe = async (req, res) => {
  const data = await svc.getManager(req.user.uid);
  res.json(data || {});
};

exports.upsertMe = async (req, res) => {
  const saved = await svc.upsertManager(req.user.uid, req.body);
  res.json(saved);
};

exports.getMonthlyStats = async (req, res) => {
  const { hotelId } = req.params;
  const { year, month } = req.query;
  const stats = await svc.monthlyStats(hotelId, year, month);
  if (!stats) return res.status(404).json({ error: "No stats" });
  res.json(stats);
};

exports.patchHotel = async (req, res) => {
  const hotel = await svc.updateHotel(req.params.hotelId, req.body);
  res.json(hotel);
};
