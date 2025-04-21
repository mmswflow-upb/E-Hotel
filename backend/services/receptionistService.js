const { db, admin } = require("../firebase");
const { COLLECTION } = require("../models/receptionist");

class ReceptionistService {
  /** create or update a receptionist profile */
  async upsert(uid, data) {
    const ref = db.collection(COLLECTION).doc(uid);
    await ref.set(
      { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    return (await ref.get()).data();
  }

  async get(uid) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  /** Create a booking for a customer */
  async createBooking({
    hotelID,
    customerID,
    roomNumber,
    ci,
    co,
    totalAmount,
  }) {
    // find the room doc
    const q = await db
      .collection("rooms")
      .where("hotelID", "==", hotelID)
      .where("roomNumber", "==", roomNumber.toString())
      .limit(1)
      .get();
    if (q.empty) throw new Error("Room not found");
    const roomID = q.docs[0].id;

    const ref = await db.collection("bookings").add({
      hotelID,
      customerID,
      roomDetails: [roomID],
      checkInDate: admin.firestore.Timestamp.fromDate(ci),
      checkOutDate: admin.firestore.Timestamp.fromDate(co),
      totalAmount,
      status: "booked",
      createdAt: admin.firestore.Timestamp.now(),
      cancellationGracePeriod: 24,
    });
    return { id: ref.id };
  }

  async updateBookingStatus(bookingID, status) {
    await db
      .collection("bookings")
      .doc(bookingID)
      .update({
        status,
        [`${status}At`]: admin.firestore.Timestamp.now(),
      });
  }
}

module.exports = new ReceptionistService();
