const svc = require("../services/receptionistService");

exports.getMe = async (req, res) => {
  try {
    const data = await svc.get(req.user.uid);
    res.json(data || {});
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.upsertMe = async (req, res) => {
  try {
    const saved = await svc.upsert(req.user.uid, req.body);
    res.json(saved);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
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
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("insufficient")) {
      res.status(402).json({ error: e.message });
    } else if (e.message.includes("unavailable")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};

exports.cancel = async (req, res) => {
  try {
    await svc.updateBookingStatus(req.params.bookingId, "canceled");
    res.sendStatus(204);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("cannot cancel")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.checkIn = async (req, res) => {
  try {
    await svc.updateBookingStatus(req.params.bookingId, "occupied");
    res.sendStatus(204);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("cannot check in")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.checkOut = async (req, res) => {
  try {
    await svc.updateBookingStatus(req.params.bookingId, "completed");
    res.sendStatus(204);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("cannot check out")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};
