const { db, admin } = require("../firebase");
const { COLLECTION } = require("../models/hotelManager");

class HotelManagerService {
  /** Create or update a hotel‑manager profile */
  async upsertManager(uid, data) {
    const ref = db.collection(COLLECTION).doc(uid);
    await ref.set(
      {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return (await ref.get()).data();
  }

  /** Get manager profile by UID */
  async getManager(uid) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  /** Monthly stats for one hotel */
  async monthlyStats(hotelID, year, month) {
    const period = `${year}-${String(month).padStart(2, "0")}`;
    const q = await db
      .collection("stats")
      .where("hotelID", "==", hotelID)
      .where("period", "==", period)
      .limit(1)
      .get();
    if (q.empty) return null;
    return { id: q.docs[0].id, ...q.docs[0].data() };
  }

  /** Let a manager patch hotel meta (name, starRating, address, etc.) */
  async updateHotel(hotelID, patch) {
    await db.collection("hotels").doc(hotelID).update(patch);
    const doc = await db.collection("hotels").doc(hotelID).get();
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = new HotelManagerService();
