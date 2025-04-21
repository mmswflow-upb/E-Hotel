// services/bookingService.js
const { db, admin } = require("../firebase");
const Booking = require("../models/Booking");
const CancellationRecord = require("../models/CancellationRecord");
const PaymentTransaction = require("../models/PaymentTransaction");
const Invoice = require("../models/Invoice");
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
  // roomDetails is array of room IDs
  const ok = await roomService.checkAvailability(hotelId, roomDetails);
  if (!ok) throw new Error("One or more rooms unavailable");

  // mark rooms booked
  await Promise.all(
    roomDetails.map((rid) => roomService.updateRoomStatus(rid, "booked"))
  );

  const payload = {
    hotelID: hotelId,
    customerID,
    roomDetails,
    checkInDate: admin.firestore.Timestamp.fromDate(new Date(checkInDate)),
    checkOutDate: admin.firestore.Timestamp.fromDate(new Date(checkOutDate)),
    cancellationGracePeriod,
    totalAmount,
    status: "booked",
    createdAt: admin.firestore.Timestamp.now(),
  };
  const ref = await bookingsCol.add(payload);
  const d = await ref.get();
  return new Booking({
    bookingID: d.id,
    hotelID: hotelId,
    customerID,
    roomDetails,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    cancellationGracePeriod,
    totalAmount,
    status: "booked",
    createdAt: d.data().createdAt.toDate(),
  });
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
  const doc = await bookingsCol.doc(bookingID).get();
  if (!doc.exists) throw new Error("Booking not found");
  const data = doc.data();
  if (data.hotelID !== hotelId) throw new Error("Wrong hotel");
  if (data.status !== "booked") throw new Error("Cannot cancel");

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
};

exports.checkInBooking = async ({ hotelId, bookingID }) => {
  const doc = await bookingsCol.doc(bookingID).get();
  if (!doc.exists) throw new Error("Booking not found");
  const data = doc.data();
  if (data.hotelID !== hotelId) throw new Error("Wrong hotel");
  if (data.status !== "booked") throw new Error("Cannot check in");

  await bookingsCol.doc(bookingID).update({ status: "occupied" });
  await Promise.all(
    data.roomDetails.map((rid) => roomService.updateRoomStatus(rid, "occupied"))
  );
  return { bookingID };
};

exports.checkOutBooking = async ({ hotelId, bookingID }) => {
  const doc = await bookingsCol.doc(bookingID).get();
  if (!doc.exists) throw new Error("Booking not found");
  const data = doc.data();
  if (data.hotelID !== hotelId) throw new Error("Wrong hotel");
  if (data.status !== "occupied") throw new Error("Cannot check out");

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
  const payment = new PaymentTransaction({
    transactionID: pDoc.id,
    bookingID,
    amount: pDoc.data().amount,
    paymentMethod: pDoc.data().paymentMethod,
    transactionDate: pDoc.data().transactionDate.toDate(),
    status: pDoc.data().status,
  });
  // generate invoice
  const invPayload = {
    hotelID: hotelId,
    bookingID,
    itemizedCharges: [`Room + services: ${data.totalAmount}`],
    totalAmount: data.totalAmount,
    issueDate: admin.firestore.Timestamp.fromDate(now),
  };
  const iRef = await invoicesCol.add(invPayload);
  const iDoc = await iRef.get();
  const invoice = new Invoice({
    invoiceID: iDoc.id,
    bookingID,
    itemizedCharges: iDoc.data().itemizedCharges,
    totalAmount: iDoc.data().totalAmount,
    issueDate: iDoc.data().issueDate.toDate(),
  });

  return { payment, invoice };
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
