// controllers/hotelController.js
const hotelSvc = require("../services/hotelService");

exports.list = async (req, res) => {
  const hotels = await hotelSvc.listHotels();
  res.json(hotels);
};

exports.create = async (req, res) => {
  try {
    const h = await hotelSvc.createHotel(req.body);
    res.status(201).json(h);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
