// models/Room.js
/**
 * @class Room
 * @prop {string} roomNumber
 * @prop {string} type           // e.g. "single" or "double"
 * @prop {string} status         // "available", "booked", or "occupied"
 * @prop {string} hotelID
 * @prop {number} pricePerNight  // price per night in the room
 */
class Room {
  constructor({ roomNumber, type, status, hotelID, pricePerNight }) {
    this.roomNumber = roomNumber;
    this.type = type;
    this.status = status;
    this.hotelID = hotelID;
    this.pricePerNight = pricePerNight;
  }
}

module.exports = Room;
