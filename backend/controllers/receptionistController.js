const svc = require("../services/receptionistService");

exports.getMe = async (req, res) => {
  const data = await svc.get(req.user.uid);
  res.json(data || {});
};

exports.upsertMe = async (req, res) => {
  const saved = await svc.upsert(req.user.uid, req.body);
  res.json(saved);
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await svc.createBooking({
      hotelID: req.params.hotelId,
      customerID: req.body.customerID,
      roomNumber: req.body.roomNumber,
      ci: new Date(req.body.checkInDate),
      co: new Date(req.body.checkOutDate),
      totalAmount: req.body.totalAmount,
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancel = (req, res) =>
  svc
    .updateBookingStatus(req.params.bookingId, "canceled")
    .then(() => res.sendStatus(204));

exports.checkIn = (req, res) =>
  svc
    .updateBookingStatus(req.params.bookingId, "occupied")
    .then(() => res.sendStatus(204));

exports.checkOut = (req, res) =>
  svc
    .updateBookingStatus(req.params.bookingId, "completed")
    .then(() => res.sendStatus(204));
