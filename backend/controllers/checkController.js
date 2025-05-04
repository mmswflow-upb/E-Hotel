// controllers/checkController.js
const bookingSvc = require("../services/bookingService");

exports.checkIn = async (req, res) => {
  try {
    await bookingSvc.checkInBooking({
      hotelId: req.params.hotelId,
      bookingID: req.params.bookingId,
    });
    res.json({ success: true });
  } catch (e) {
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("cannot check in")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};

exports.checkOut = async (req, res) => {
  try {
    const result = await bookingSvc.checkOutBooking({
      hotelId: req.params.hotelId,
      bookingID: req.params.bookingId,
    });
    res.json(result);
  } catch (e) {
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("cannot check out")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};
