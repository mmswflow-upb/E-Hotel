/**
 * Firestore collection that stores receptionist (front‑desk) accounts.
 * Each receptionist belongs to exactly one hotel.
 */
const COLLECTION = "receptionists";

class Receptionist {
  /**
   * @param {Object} data
   * @param {string} data.uid       Firebase‑Auth UID (doc‑ID)
   * @param {string} data.name      Display name
   * @param {string} data.hotelID   Hotel document‑ID where the receptionist works
   * @param {import("firebase-admin").firestore.Timestamp} [data.createdAt]
   */
  constructor({ uid, name, hotelID, createdAt = null }) {
    this.uid = uid;
    this.name = name;
    this.hotelID = hotelID;
    this.createdAt = createdAt; // set by service on insert
  }
}

module.exports = { COLLECTION, Receptionist };
