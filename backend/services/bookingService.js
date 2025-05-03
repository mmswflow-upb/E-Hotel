// services/bookingService.js
const { db, admin } = require("../firebase");
const Booking = require("../models/booking");
const CancellationRecord = require("../models/cancellationRecord");
const PaymentTransaction = require("../models/paymentTransaction");
const Invoice = require("../models/invoice");
const roomService = require("./roomService");

const bookingsCol = db.collection("bookings");
const cancelsCol = db.collection("cancellations");
const paymentsCol = db.collection("paymentTransactions");
const invoicesCol = db.collection("invoices");

exports.createBooking = async ({
  hotelId,
  customerID,
  roomDetails,
  checkInDate,
  checkOutDate,
  cancellationGracePeriod = 24,
  totalAmount,
}) => {
  try {
    console.log("Starting booking creation process...");
    // Validate required fields
    if (!hotelId) return { error: "Hotel ID is required" };
    if (!customerID) return { error: "Customer ID is required" };
    if (
      !roomDetails ||
      !Array.isArray(roomDetails) ||
      roomDetails.length === 0
    ) {
      return { error: "Room details are required" };
    }
    if (!checkInDate) return { error: "Check-in date is required" };
    if (!checkOutDate) return { error: "Check-out date is required" };
    if (!totalAmount) return { error: "Total amount is required" };

    console.log("Checking customer balance...");
    // Check customer balance
    const customerDoc = await db.collection("customers").doc(customerID).get();
    if (!customerDoc.exists) return { error: "Customer not found" };
    const customerData = customerDoc.data();
    const hasSufficientBalance = customerData.balance >= totalAmount;

    console.log("Checking room availability...");
    const ok = await roomService.checkAvailability(hotelId, roomDetails);
    if (!ok) return { error: "One or more rooms unavailable" };

    console.log("Starting transaction...");
    let bookingId;
    // Start a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      if (hasSufficientBalance) {
        console.log("Updating customer balance...");
        // Update customer balance only if sufficient
        transaction.update(db.collection("customers").doc(customerID), {
          balance: admin.firestore.FieldValue.increment(-totalAmount),
        });
      }

      console.log("Creating payment transaction...");
      // Create payment transaction
      const paymentPayload = {
        bookingID: null, // Will be updated after booking creation
        amount: totalAmount,
        paymentMethod: "balance",
        transactionDate: admin.firestore.Timestamp.now(),
        status: hasSufficientBalance ? "approved" : "pending",
      };
      const paymentRef = db.collection("paymentTransactions").doc();
      transaction.set(paymentRef, paymentPayload);

      console.log("Updating room status...");
      // mark rooms booked
      await Promise.all(
        roomDetails.map((rid) => roomService.updateRoomStatus(rid, "booked"))
      );

      const bookingPayload = {
        hotelID: hotelId,
        customerID,
        roomDetails,
        checkInDate: admin.firestore.Timestamp.fromDate(new Date(checkInDate)),
        checkOutDate: admin.firestore.Timestamp.fromDate(
          new Date(checkOutDate)
        ),
        cancellationGracePeriod,
        totalAmount,
        status: "booked",
        createdAt: admin.firestore.Timestamp.now(),
        paymentTransactionID: paymentRef.id,
      };

      console.log("Creating booking...");
      // Create booking
      const bookingRef = db.collection("bookings").doc();
      bookingId = bookingRef.id;
      transaction.set(bookingRef, bookingPayload);

      console.log("Updating payment transaction with booking ID...");
      // Update payment transaction with booking ID
      transaction.update(paymentRef, {
        bookingID: bookingId,
      });
    });

    console.log("Transaction completed, retrieving booking...");
    // Get the created booking
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      console.log("Failed to find created booking");
      return { error: "Failed to create booking" };
    }

    console.log(`✅ New booking created with ID: ${bookingId}`);

    const bookingData = bookingDoc.data();
    return new Booking({
      bookingID: bookingId,
      hotelID: hotelId,
      customerID,
      roomDetails,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      cancellationGracePeriod,
      totalAmount,
      status: "booked",
      createdAt: bookingData.createdAt.toDate(),
    });
  } catch (e) {
    console.error("Error in createBooking:", e);
    return { error: e.message };
  }
};

exports.listUserBookings = async (hotelId, customerID) => {
  const snap = await bookingsCol
    .where("hotelID", "==", hotelId)
    .where("customerID", "==", customerID)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return new Booking({
      bookingID: d.id,
      hotelID,
      customerID,
      roomDetails: data.roomDetails,
      checkInDate: data.checkInDate.toDate(),
      checkOutDate: data.checkOutDate.toDate(),
      checkedOutAt: data.checkedOutAt?.toDate(),
      cancellationGracePeriod: data.cancellationGracePeriod,
      totalAmount: data.totalAmount,
      status: data.status,
      createdAt: data.createdAt.toDate(),
    });
  });
};

exports.listAllUserBookings = async (uid) => {
  const snap = await bookingsCol.where("customerID", "==", uid).get();
  const bookings = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();

      // Get hotel details
      const hotelDoc = await db.collection("hotels").doc(data.hotelID).get();
      const hotelData = hotelDoc.data();

      // Get room details
      const roomPromises = data.roomDetails.map((roomId) =>
        db.collection("rooms").doc(roomId).get()
      );
      const roomDocs = await Promise.all(roomPromises);
      const roomDetails = roomDocs.map((roomDoc) => ({
        roomNumber: roomDoc.data().roomNumber,
        type: roomDoc.data().type,
        status: roomDoc.data().status,
      }));

      // Get payment status
      const paymentSnap = await db
        .collection("paymentTransactions")
        .where("bookingID", "==", d.id)
        .get();
      const paymentStatus = paymentSnap.empty
        ? "pending"
        : paymentSnap.docs[0].data().status;

      // Get invoice status
      const invoiceSnap = await db
        .collection("invoices")
        .where("bookingID", "==", d.id)
        .get();
      const hasInvoice = !invoiceSnap.empty;

      return new Booking({
        bookingID: d.id,
        hotelID: data.hotelID,
        hotelDetails: {
          name: hotelData.name,
          address: hotelData.address,
          starRating: hotelData.starRating,
        },
        customerID: uid,
        roomDetails,
        checkInDate: data.checkInDate.toDate(),
        checkOutDate: data.checkOutDate.toDate(),
        checkedOutAt: data.checkedOutAt?.toDate(),
        cancellationGracePeriod: data.cancellationGracePeriod,
        totalAmount: data.totalAmount,
        status: data.status,
        paymentStatus,
        hasInvoice,
        createdAt: data.createdAt.toDate(),
      });
    })
  );
  return bookings;
};

exports.listHotelBookings = async (hotelId) => {
  const snap = await bookingsCol.where("hotelID", "==", hotelId).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return new Booking({
      bookingID: d.id,
      hotelID,
      customerID: data.customerID,
      roomDetails: data.roomDetails,
      checkInDate: data.checkInDate.toDate(),
      checkOutDate: data.checkOutDate.toDate(),
      checkedOutAt: data.checkedOutAt?.toDate(),
      cancellationGracePeriod: data.cancellationGracePeriod,
      totalAmount: data.totalAmount,
      status: data.status,
      createdAt: data.createdAt.toDate(),
    });
  });
};

exports.cancelBooking = async ({ hotelId, bookingID, canceledBy }) => {
  try {
    if (!hotelId) return { error: "Hotel ID is required" };
    if (!bookingID) return { error: "Booking ID is required" };
    if (!canceledBy) return { error: "Canceled by is required" };

    const doc = await bookingsCol.doc(bookingID).get();
    if (!doc.exists) return { error: "Booking not found" };
    const data = doc.data();
    if (data.hotelID !== hotelId) return { error: "Wrong hotel" };
    if (data.status !== "booked") return { error: "Cannot cancel" };

    const createdAt = data.createdAt.toDate();
    const now = new Date();
    const hours = (now - createdAt) / 36e5;
    const penalty =
      hours > data.cancellationGracePeriod ? data.totalAmount * 0.5 : 0;

    await bookingsCol.doc(bookingID).update({ status: "canceled" });
    // free rooms
    await Promise.all(
      data.roomDetails.map((rid) =>
        roomService.updateRoomStatus(rid, "available")
      )
    );
    // log cancellation
    const payload = {
      hotelID: hotelId,
      bookingID,
      canceledBy,
      cancellationTime: admin.firestore.Timestamp.fromDate(now),
      penaltyApplied: penalty,
    };
    const cref = await cancelsCol.add(payload);
    const cd = await cref.get();
    return new CancellationRecord({
      cancellationID: cd.id,
      bookingID,
      cancellationTime: cd.data().cancellationTime.toDate(),
      penaltyApplied: cd.data().penaltyApplied,
    });
  } catch (e) {
    return { error: e.message };
  }
};

exports.checkInBooking = async ({ hotelId, bookingID }) => {
  try {
    if (!hotelId) return { error: "Hotel ID is required" };
    if (!bookingID) return { error: "Booking ID is required" };

    const doc = await bookingsCol.doc(bookingID).get();
    if (!doc.exists) return { error: "Booking not found" };
    const data = doc.data();
    if (data.hotelID !== hotelId) return { error: "Wrong hotel" };
    if (data.status !== "booked") return { error: "Cannot check in" };

    await bookingsCol.doc(bookingID).update({ status: "occupied" });
    await Promise.all(
      data.roomDetails.map((rid) =>
        roomService.updateRoomStatus(rid, "occupied")
      )
    );
    return { bookingID };
  } catch (e) {
    return { error: e.message };
  }
};

exports.checkOutBooking = async ({ hotelId, bookingID }) => {
  try {
    if (!hotelId) return { error: "Hotel ID is required" };
    if (!bookingID) return { error: "Booking ID is required" };

    const doc = await bookingsCol.doc(bookingID).get();
    if (!doc.exists) return { error: "Booking not found" };
    const data = doc.data();
    if (data.hotelID !== hotelId) return { error: "Wrong hotel" };
    if (data.status !== "occupied") return { error: "Cannot check out" };

    const now = new Date();
    await bookingsCol.doc(bookingID).update({
      status: "completed",
      checkedOutAt: admin.firestore.Timestamp.fromDate(now),
    });
    // free rooms
    await Promise.all(
      data.roomDetails.map((rid) =>
        roomService.updateRoomStatus(rid, "available")
      )
    );
    // record payment
    const payPayload = {
      hotelID: hotelId,
      bookingID,
      amount: data.totalAmount,
      paymentMethod: "card",
      transactionDate: admin.firestore.Timestamp.fromDate(now),
      status: "approved",
    };
    const pRef = await paymentsCol.add(payPayload);
    const pDoc = await pRef.get();
    return new PaymentTransaction({
      transactionID: pDoc.id,
      bookingID,
      amount: pDoc.data().amount,
      paymentMethod: pDoc.data().paymentMethod,
      transactionDate: pDoc.data().transactionDate.toDate(),
      status: pDoc.data().status,
    });
  } catch (e) {
    return { error: e.message };
  }
};

exports.listBookings = async ({ customerID, hotelId, staffId } = {}) => {
  let query = bookingsCol;

  if (customerID) {
    query = query.where("customerID", "==", customerID);
  } else if (hotelId) {
    query = query.where("hotelID", "==", hotelId);
  } else if (staffId) {
    // For staff, get bookings for hotels they manage/work at
    const staffDoc = await db.collection("staff").doc(staffId).get();
    const staffData = staffDoc.data();
    if (staffData.hotelId) {
      query = query.where("hotelID", "==", staffData.hotelId);
    }
  }

  const snap = await query.get();
  const bookings = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();

      // Get hotel details
      const hotelDoc = await db.collection("hotels").doc(data.hotelID).get();
      const hotelData = hotelDoc.data();

      // Get room details
      const roomPromises = data.roomDetails.map((roomId) =>
        db.collection("rooms").doc(roomId).get()
      );
      const roomDocs = await Promise.all(roomPromises);
      const roomDetails = roomDocs.map((roomDoc) => ({
        roomNumber: roomDoc.data().roomNumber,
        type: roomDoc.data().type,
        status: roomDoc.data().status,
      }));

      // Get payment status
      const paymentSnap = await db
        .collection("paymentTransactions")
        .where("bookingID", "==", d.id)
        .get();
      const paymentStatus = paymentSnap.empty
        ? "pending"
        : paymentSnap.docs[0].data().status;

      // Get invoice status
      const invoiceSnap = await db
        .collection("invoices")
        .where("bookingID", "==", d.id)
        .get();
      const hasInvoice = !invoiceSnap.empty;

      return new Booking({
        bookingID: d.id,
        hotelID: data.hotelID,
        hotelDetails: {
          name: hotelData.name,
          address: hotelData.address,
          starRating: hotelData.starRating,
        },
        customerID: data.customerID,
        roomDetails,
        checkInDate: data.checkInDate.toDate(),
        checkOutDate: data.checkOutDate.toDate(),
        checkedOutAt: data.checkedOutAt?.toDate(),
        cancellationGracePeriod: data.cancellationGracePeriod,
        totalAmount: data.totalAmount,
        status: data.status,
        paymentStatus,
        hasInvoice,
        createdAt: data.createdAt.toDate(),
      });
    })
  );
  return bookings;
};

exports.getBookingById = async (bookingId, { customerId, staffId } = {}) => {
  const doc = await bookingsCol.doc(bookingId).get();
  if (!doc.exists) return null;

  const data = doc.data();

  // Get hotel details
  const hotelDoc = await db.collection("hotels").doc(data.hotelID).get();
  const hotelData = hotelDoc.data();

  // Get room details
  const roomPromises = data.roomDetails.map((roomId) =>
    db.collection("rooms").doc(roomId).get()
  );
  const roomDocs = await Promise.all(roomPromises);
  const roomDetails = roomDocs.map((roomDoc) => ({
    roomNumber: roomDoc.data().roomNumber,
    type: roomDoc.data().type,
    status: roomDoc.data().status,
  }));

  // Get payment status
  const paymentSnap = await db
    .collection("paymentTransactions")
    .where("bookingID", "==", doc.id)
    .get();
  const paymentStatus = paymentSnap.empty
    ? "pending"
    : paymentSnap.docs[0].data().status;

  // Get invoice status
  const invoiceSnap = await db
    .collection("invoices")
    .where("bookingID", "==", doc.id)
    .get();
  const hasInvoice = !invoiceSnap.empty;

  // Check access permissions
  if (customerId && data.customerID !== customerId) return null;
  if (staffId) {
    const staffDoc = await db.collection("staff").doc(staffId).get();
    const staffData = staffDoc.data();
    if (staffData.hotelId && data.hotelID !== staffData.hotelId) return null;
  }

  return new Booking({
    bookingID: doc.id,
    hotelID: data.hotelID,
    hotelDetails: {
      name: hotelData.name,
      address: hotelData.address,
      starRating: hotelData.starRating,
    },
    customerID: data.customerID,
    roomDetails,
    checkInDate: data.checkInDate.toDate(),
    checkOutDate: data.checkOutDate.toDate(),
    checkedOutAt: data.checkedOutAt?.toDate(),
    cancellationGracePeriod: data.cancellationGracePeriod,
    totalAmount: data.totalAmount,
    status: data.status,
    paymentStatus,
    hasInvoice,
    createdAt: data.createdAt.toDate(),
  });
};

exports.categorizeBookings = (bookings) => {
  const now = new Date();
  return bookings.reduce(
    (acc, booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);

      // If booking is cancelled, always put it in history
      if (booking.status === "canceled") {
        acc.history.push(booking);
      } else if (checkOutDate < now) {
        acc.history.push(booking);
      } else if (checkInDate <= now && now <= checkOutDate) {
        acc.active.push(booking);
      } else {
        acc.future.push(booking);
      }

      return acc;
    },
    { history: [], active: [], future: [] }
  );
};
