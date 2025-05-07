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
    if (!hotelId) throw new Error("Hotel ID is required");
    if (!customerID) throw new Error("Customer ID is required");
    if (
      !roomDetails ||
      !Array.isArray(roomDetails) ||
      roomDetails.length === 0
    ) {
      throw new Error("Room details are required");
    }
    if (!checkInDate) throw new Error("Check-in date is required");
    if (!checkOutDate) throw new Error("Check-out date is required");

    // Calculate number of nights
    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0)
      throw new Error("Check-out date must be after check-in date");

    // Get room details and calculate total amount
    let calculatedTotalAmount = 0;
    const roomData = await Promise.all(
      roomDetails.map(async (roomId) => {
        const roomDoc = await db.collection("rooms").doc(roomId).get();
        if (!roomDoc.exists) throw new Error("Room not found");
        const room = roomDoc.data();
        if (room.hotelID !== hotelId)
          throw new Error("Room does not belong to this hotel");
        calculatedTotalAmount += room.pricePerNight * nights;
        return room;
      })
    );

    // Use the calculated total amount
    totalAmount = calculatedTotalAmount;

    console.log("Checking customer balance...");
    // Check customer balance
    const customerDoc = await db.collection("customers").doc(customerID).get();
    if (!customerDoc.exists) throw new Error("Customer not found");
    const customerData = customerDoc.data();
    const hasSufficientBalance = customerData.balance >= totalAmount;

    console.log("Checking room availability...");
    const ok = await roomService.checkAvailability(hotelId, roomDetails, {
      checkInDate,
      checkOutDate,
    });
    if (!ok) throw new Error("One or more rooms unavailable");

    console.log("Starting transaction...");
    let bookingId;
    // Start a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
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
        paymentStatus: "waiting",
      };

      console.log("Creating booking...");
      // Create booking
      const bookingRef = db.collection("bookings").doc();
      bookingId = bookingRef.id;
      transaction.set(bookingRef, bookingPayload);
    });

    console.log("Transaction completed, retrieving booking...");
    // Get the created booking
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      console.log("Failed to find created booking");
      throw new Error("Failed to create booking");
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
      paymentStatus: "waiting",
      createdAt: bookingData.createdAt.toDate(),
    });
  } catch (e) {
    throw e;
  }
};

exports.listUserBookings = async (hotelId, customerID) => {
  const snap = await bookingsCol
    .where("hotelID", "==", hotelId)
    .where("customerID", "==", customerID)
    .get();

  const bookings = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();

      // Get hotel details
      const hotelDoc = await db.collection("hotels").doc(data.hotelID).get();
      if (!hotelDoc.exists) {
        console.warn(`Hotel ${data.hotelID} not found for booking ${d.id}`);
        return null;
      }
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

      // For cancelled bookings, use their existing payment status
      let paymentStatus;
      if (data.status === "cancelled") {
        paymentStatus = data.paymentStatus;
      } else {
        paymentStatus = paymentSnap.empty
          ? "waiting"
          : paymentSnap.docs[0].data().status;
      }

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
          phone: hotelData.phone || "",
          email: hotelData.email || "",
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

  // Filter out any null bookings (from missing hotels)
  return bookings.filter((booking) => booking !== null);
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

      // For cancelled bookings, use their existing payment status
      if (data.status === "cancelled") {
        paymentStatus = data.paymentStatus;
      } else {
        // For non-cancelled bookings, check payment transactions
        paymentStatus = paymentSnap.empty
          ? "waiting"
          : paymentSnap.docs[0].data().status;

        // If payment status is waiting, check if it's due to insufficient funds
        if (paymentStatus === "waiting") {
          const customerDoc = await db
            .collection("customers")
            .doc(data.customerID)
            .get();
          const customerData = customerDoc.data();
          if (customerData.balance < data.totalAmount) {
            paymentStatus = "insufficient_funds";
          }
        }
      }

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
          phone: hotelData.phone || "",
          email: hotelData.email || "",
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
    if (!hotelId) throw new Error("Hotel ID is required");
    if (!bookingID) throw new Error("Booking ID is required");
    if (!canceledBy) throw new Error("Canceled by is required");

    const doc = await bookingsCol.doc(bookingID).get();
    if (!doc.exists) throw new Error("Booking not found");
    const data = doc.data();
    if (data.hotelID !== hotelId) throw new Error("Wrong hotel");
    if (data.status !== "booked" && data.status !== "checked-in")
      throw new Error("Cannot cancel");

    const now = new Date();
    const checkInDate = data.checkInDate.toDate();
    const hoursUntilCheckIn = (checkInDate - now) / 36e5;

    // Calculate penalty based on booking status
    let penalty;
    if (data.status === "checked-in") {
      // For active bookings, charge full amount
      penalty = data.totalAmount;
    } else {
      // For future bookings, apply 50% penalty if within grace period
      penalty =
        hoursUntilCheckIn <= data.cancellationGracePeriod
          ? data.totalAmount * 0.5
          : 0;
    }

    // If there's a penalty, check if the customer has sufficient funds
    if (penalty > 0) {
      const customerDoc = await db
        .collection("customers")
        .doc(data.customerID)
        .get();
      if (!customerDoc.exists) throw new Error("Customer not found");
      const customerData = customerDoc.data();
      if (customerData.balance < penalty) {
        throw new Error("Insufficient funds to pay cancellation penalty");
      }
    }

    // Start a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Update booking status
      transaction.update(bookingsCol.doc(bookingID), { status: "cancelled" });

      // Free rooms
      await Promise.all(
        data.roomDetails.map((rid) =>
          roomService.updateRoomStatus(rid, "available")
        )
      );

      if (penalty > 0) {
        // Deduct penalty from customer balance
        transaction.update(db.collection("customers").doc(data.customerID), {
          balance: admin.firestore.FieldValue.increment(-penalty),
        });

        // Create payment transaction for penalty
        const paymentPayload = {
          bookingID,
          amount: penalty,
          paymentMethod: "balance",
          transactionDate: admin.firestore.Timestamp.now(),
          status: "Paid Penalties",
          type: "penalty",
        };
        const paymentRef = db.collection("paymentTransactions").doc();
        transaction.set(paymentRef, paymentPayload);

        // Create invoice for penalty payment
        const invoicePayload = {
          bookingID,
          hotelID: hotelId,
          roomCharges: [],
          serviceCharges: [
            {
              name: "Cancellation Penalty",
              total: penalty,
              quantity: 1,
              unit: "penalty",
            },
          ],
          totalAmount: penalty,
          issueDate: admin.firestore.Timestamp.now(),
          status: "Paid Penalties",
        };
        const invoiceRef = db.collection("invoices").doc();
        transaction.set(invoiceRef, invoicePayload);

        // Update booking payment status to Paid Penalties
        transaction.update(bookingsCol.doc(bookingID), {
          paymentStatus: "Paid Penalties",
        });
      } else {
        // Update booking status and payment status to no penalties
        transaction.update(bookingsCol.doc(bookingID), {
          status: "cancelled",
          paymentStatus: "no penalties",
        });
      }

      // Log cancellation
      const payload = {
        hotelID: hotelId,
        bookingID,
        canceledBy,
        cancellationTime: admin.firestore.Timestamp.fromDate(now),
        penaltyApplied: penalty,
        penaltyPaid: penalty > 0,
      };
      transaction.set(cancelsCol.doc(), payload);
    });

    return { bookingID };
  } catch (e) {
    throw e;
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

    await bookingsCol.doc(bookingID).update({ status: "checked-in" });
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
    if (data.status !== "checked-in") return { error: "Cannot check out" };

    const now = new Date();
    await bookingsCol.doc(bookingID).update({
      status: "checked-out",
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
    if (!staffDoc.exists) {
      throw new Error("Staff member not found");
    }
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
      if (!hotelDoc.exists) {
        console.warn(`Hotel ${data.hotelID} not found for booking ${d.id}`);
        return null;
      }
      const hotelData = hotelDoc.data();

      // Get customer details
      const customerDoc = await db
        .collection("customers")
        .doc(data.customerID)
        .get();
      if (!customerDoc.exists) {
        console.warn(
          `Customer ${data.customerID} not found for booking ${d.id}`
        );
        return null;
      }
      const customerData = customerDoc.data();

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

      // For cancelled bookings, use their existing payment status
      let paymentStatus;
      if (data.status === "cancelled") {
        paymentStatus = data.paymentStatus;
      } else {
        paymentStatus = paymentSnap.empty
          ? "waiting"
          : paymentSnap.docs[0].data().status;
      }

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
          phone: hotelData.phone || "",
          email: hotelData.email || "",
        },
        customerID: data.customerID,
        customerDetails: {
          name: customerData.name || "",
          email: customerData.email || "",
          phoneNumber: customerData.phoneNumber || "",
        },
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

  // Filter out any null bookings (from missing hotels or customers)
  return bookings.filter((booking) => booking !== null);
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

  // For cancelled bookings, use their existing payment status
  let paymentStatus;
  if (data.status === "cancelled") {
    paymentStatus = data.paymentStatus;
  } else {
    paymentStatus = paymentSnap.empty
      ? "waiting"
      : paymentSnap.docs[0].data().status;
  }

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
      phone: hotelData.phone || "",
      email: hotelData.email || "",
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
  return bookings.reduce(
    (acc, booking) => {
      if (booking.status === "cancelled" || booking.status === "checked-out") {
        acc.history.push(booking);
      } else if (booking.status === "checked-in") {
        acc.active.push(booking);
      } else if (booking.status === "booked") {
        acc.future.push(booking);
      }
      return acc;
    },
    { history: [], active: [], future: [] }
  );
};

exports.payPenalty = async ({ hotelId, bookingID, customerID }) => {
  try {
    if (!hotelId) return { error: "Hotel ID is required" };
    if (!bookingID) return { error: "Booking ID is required" };
    if (!customerID) return { error: "Customer ID is required" };

    const doc = await bookingsCol.doc(bookingID).get();
    if (!doc.exists) return { error: "Booking not found" };
    const data = doc.data();
    if (data.hotelID !== hotelId) return { error: "Wrong hotel" };
    if (data.status !== "canceled") return { error: "Booking is not canceled" };

    // Get cancellation record to check penalty
    const cancelSnap = await db
      .collection("cancellations")
      .where("bookingID", "==", bookingID)
      .get();

    if (cancelSnap.empty) return { error: "Cancellation record not found" };
    const cancelData = cancelSnap.docs[0].data();
    if (!cancelData.penaltyApplied) return { error: "No penalty to pay" };

    // Check customer balance
    const customerDoc = await db.collection("customers").doc(customerID).get();
    if (!customerDoc.exists) return { error: "Customer not found" };
    const customerData = customerDoc.data();
    if (customerData.balance < cancelData.penaltyApplied) {
      return { error: "Insufficient balance to pay penalty" };
    }

    // Start a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Deduct penalty from customer balance
      transaction.update(db.collection("customers").doc(customerID), {
        balance: admin.firestore.FieldValue.increment(
          -cancelData.penaltyApplied
        ),
      });

      // Create payment transaction for penalty
      const paymentPayload = {
        bookingID,
        amount: cancelData.penaltyApplied,
        paymentMethod: "balance",
        transactionDate: admin.firestore.Timestamp.now(),
        status: "Paid Penalties",
        type: "penalty",
      };
      const paymentRef = db.collection("paymentTransactions").doc();
      transaction.set(paymentRef, paymentPayload);

      // Create invoice for penalty payment
      const invoicePayload = {
        bookingID,
        hotelID: hotelId,
        roomCharges: [],
        serviceCharges: [
          {
            name: "Cancellation Penalty",
            total: cancelData.penaltyApplied,
            quantity: 1,
            unit: "penalty",
          },
        ],
        totalAmount: cancelData.penaltyApplied,
        issueDate: admin.firestore.Timestamp.now(),
        status: "Paid Penalties",
      };
      const invoiceRef = db.collection("invoices").doc();
      transaction.set(invoiceRef, invoicePayload);

      // Update cancellation record
      transaction.update(cancelSnap.docs[0].ref, {
        penaltyPaid: true,
        penaltyPaymentDate: admin.firestore.Timestamp.now(),
      });

      // Update booking payment status to Paid Penalties
      transaction.update(bookingsCol.doc(bookingID), {
        paymentStatus: "Paid Penalties",
      });
    });

    return { bookingID, penaltyPaid: true };
  } catch (e) {
    return { error: e.message };
  }
};
