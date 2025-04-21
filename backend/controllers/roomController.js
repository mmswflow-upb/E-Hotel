// controllers/roomController.js
const roomSvc = require("../services/roomService");

exports.list = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    const rooms = await roomSvc.listRooms(req.params.hotelId, {
      checkInDate,
      checkOutDate,
    });
    res.json(rooms);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
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
