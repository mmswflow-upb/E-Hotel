// controllers/roomController.js
const roomSvc = require("../services/roomService");

exports.list = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    console.log(
      `📅 Received dates from frontend: checkIn=${checkIn}, checkOut=${checkOut}`
    );
    const rooms = await roomSvc.listRooms(req.params.hotelId, {
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });
    res.json(rooms);
  } catch (e) {
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("invalid date")) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: e.message });
    }
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
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("already exists")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};
