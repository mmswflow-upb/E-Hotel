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
  const bookings = await bookingSvc.listBookings({ customerID: req.user.uid });
  const categorizedBookings = bookingSvc.categorizeBookings(bookings);
  res.json(categorizedBookings);
};

exports.listAll = async (req, res) => {
  const bookings = await bookingSvc.listBookings({
    hotelId: req.query.hotelId,
    staffId: req.user.id,
  });
  res.json(bookings);
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

exports.getById = async (req, res) => {
  const booking = await bookingSvc.getBookingById(req.params.bookingId, {
    staffId: req.user.id,
  });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};

exports.getByIdMine = async (req, res) => {
  const booking = await bookingSvc.getBookingById(req.params.bookingId, {
    customerId: req.user.id,
  });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};

exports.createCustomer = async (req, res) => {
  try {
    const booking = await bookingSvc.createBooking({
      ...req.body,
      customerId: req.user.id,
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancelCustomer = async (req, res) => {
  try {
    const booking = await bookingSvc.cancelBooking(req.params.bookingId, {
      customerId: req.user.id,
    });
    res.json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.createReceptionist = async (req, res) => {
  try {
    const booking = await bookingSvc.createBooking({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancelReceptionist = async (req, res) => {
  try {
    const booking = await bookingSvc.cancelBooking(req.params.bookingId, {
      staffId: req.user.id,
    });
    res.json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const result = await bookingSvc.createBooking(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listBookings = async (req, res) => {
  try {
    const result = await bookingSvc.listBookings(req.query);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const result = await bookingSvc.cancelBooking(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkInBooking = async (req, res) => {
  try {
    const result = await bookingSvc.checkInBooking(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkOutBooking = async (req, res) => {
  try {
    const result = await bookingSvc.checkOutBooking(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
