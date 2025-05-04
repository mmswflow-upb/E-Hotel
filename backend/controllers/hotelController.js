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

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await hotelSvc.getHotelById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json(hotel);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.create = async (req, res) => {
  try {
    const h = await hotelSvc.createHotel(req.body);
    res.status(201).json(h);
  } catch (e) {
    if (e.message.includes("already exists")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};
