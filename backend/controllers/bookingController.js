// controllers/bookingController.js
const bookingSvc = require("../services/bookingService");
const { db } = require("../firebase");

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
    hotelId: req.params.hotelId,
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
    if (e.message.includes("not found")) {
      res.status(404).json({ error: e.message });
    } else if (e.message.includes("insufficient")) {
      res.status(402).json({ error: e.message });
    } else if (e.message.includes("cannot cancel")) {
      res.status(409).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
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
    const hotelId = req.hotelId;
    if (!hotelId) {
      return res.status(400).json({ error: "Missing HotelID" });
    }

    if (!req.body.roomID) {
      return res.status(400).json({ error: "Missing RoomID" });
    }

    // Query the room document to get its ID
    const roomQuery = await db
      .collection("rooms")
      .where("hotelID", "==", hotelId)
      .where("roomNumber", "==", req.body.roomID.toString())
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return res.status(400).json({ error: "Room not found" });
    }

    const roomDoc = roomQuery.docs[0];

    const booking = await bookingSvc.createBooking({
      hotelId: hotelId,
      customerID: req.user.uid,
      roomDetails: [roomDoc.id], // Use the room document ID
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      cancellationGracePeriod: 24,
      totalAmount: req.body.totalAmount || 0,
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancelCustomer = async (req, res) => {
  try {
    const booking = await bookingSvc.getBookingById(req.params.bookingId, {
      customerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingDoc = await db
      .collection("bookings")
      .doc(req.params.bookingId)
      .get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const bookingData = bookingDoc.data();

    const result = await bookingSvc.cancelBooking({
      hotelId: bookingData.hotelID,
      bookingID: req.params.bookingId,
      canceledBy: req.user.uid,
    });

    if (result.error) {
      if (result.error.includes("insufficient")) {
        return res.status(402).json({ error: result.error });
      } else if (result.error.includes("cannot cancel")) {
        return res.status(409).json({ error: result.error });
      }
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.createReceptionist = async (req, res) => {
  try {
    const booking = await bookingSvc.createBooking({
      hotelId: req.body.hotelId,
      customerID: req.body.customerID,
      roomDetails: req.body.roomDetails,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      cancellationGracePeriod: req.body.cancellationGracePeriod,
      totalAmount: req.body.totalAmount,
      createdBy: req.user.uid,
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancelReceptionist = async (req, res) => {
  try {
    // First get the booking to verify hotelId
    const booking = await bookingSvc.getBookingById(req.params.bookingId, {
      staffId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get the raw booking data from Firestore to access hotelID
    const bookingDoc = await db
      .collection("bookings")
      .doc(req.params.bookingId)
      .get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const bookingData = bookingDoc.data();

    const result = await bookingSvc.cancelBooking({
      hotelId: bookingData.hotelID,
      bookingID: req.params.bookingId,
      canceledBy: req.user.uid,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const result = await bookingSvc.createBooking(req.body);
    if (result.error) {
      if (result.error.includes("not found")) {
        return res.status(404).json({ error: result.error });
      } else if (result.error.includes("insufficient")) {
        return res.status(402).json({ error: result.error });
      } else if (result.error.includes("unavailable")) {
        return res.status(409).json({ error: result.error });
      }
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
