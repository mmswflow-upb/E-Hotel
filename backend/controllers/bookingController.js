// controllers/bookingController.js
const bookingSvc = require("../services/bookingService");

exports.create = async (req, res) => {
  try {
    const bk = await bookingSvc.createBooking({
      hotelId: req.params.hotelId,
      customerID: req.user.uid,
      roomDetails: req.body.roomDetails,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      cancellationGracePeriod: req.body.cancellationGracePeriod,
      totalAmount: req.body.totalAmount,
    });
    res.status(201).json(bk);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.listMine = async (req, res) => {
  const list = await bookingSvc.listUserBookings(
    req.params.hotelId,
    req.user.uid
  );
  res.json(list);
};

exports.listAllMine = async (req, res) => {
  try {
    const list = await bookingSvc.listAllUserBookings(req.user.uid);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const all = await bookingSvc.listHotelBookings(req.params.hotelId);
    res.json(all);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const rec = await bookingSvc.cancelBooking({
      hotelId: req.params.hotelId,
      bookingID: req.params.bookingId,
      canceledBy: req.user.uid,
    });
    res.json(rec);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
