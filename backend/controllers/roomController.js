// controllers/roomController.js
const roomSvc = require("../services/roomService");

exports.list = async (req, res) => {
  const rooms = await roomSvc.listRooms(req.params.hotelId);
  res.json(rooms);
};

exports.create = async (req, res) => {
  try {
    const room = await roomSvc.createRoom({
      hotelId: req.params.hotelId,
      roomNumber: req.body.roomNumber,
      type: req.body.type,
    });
    res.status(201).json(room);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
