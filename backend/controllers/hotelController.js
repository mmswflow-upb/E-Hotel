// controllers/hotelController.js
const hotelSvc = require("../services/hotelService");

exports.listPublic = async (req, res) => {
  const hotels = await hotelSvc.listHotels({ publicOnly: true });
  res.json(hotels);
};

exports.listAll = async (req, res) => {
  const hotels = await hotelSvc.listHotels({ includeAll: true });
  res.json(hotels);
};

exports.listManaged = async (req, res) => {
  const hotels = await hotelSvc.listHotels({ managerId: req.user.id });
  res.json(hotels);
};

exports.listAssigned = async (req, res) => {
  const hotels = await hotelSvc.listHotels({ receptionistId: req.user.id });
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
