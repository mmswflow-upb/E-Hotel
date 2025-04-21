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
    res.status(400).json({ error: e.message });
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
    res.status(400).json({ error: e.message });
  }
};
