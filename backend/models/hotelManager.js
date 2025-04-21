/**
 * Firestore collection that stores hotel‑manager profiles.
 * A manager may supervise one or more hotels.
 */
const COLLECTION = "hotelManagers";

class HotelManager {
  /**
   * @param {Object} data
   * @param {string} data.uid        Firebase‑Auth UID (primary key / doc‑ID)
   * @param {string} data.name       Display name
   * @param {string[]} data.hotelIDs Array of hotel document‑IDs this manager runs
   * @param {import("firebase-admin").firestore.Timestamp} [data.createdAt]
   */
  constructor({ uid, name, hotelIDs = [], createdAt = null }) {
    this.uid = uid;
    this.name = name;
    this.hotelIDs = hotelIDs;
    this.createdAt = createdAt; // set by service on insert
  }
}

module.exports = { COLLECTION, HotelManager };
