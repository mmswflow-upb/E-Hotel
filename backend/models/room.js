// models/Room.js
/**
 * @class Room
 * @prop {string} roomNumber
 * @prop {string} type           // e.g. "single" or "double"
 * @prop {string} status         // "available", "booked", or "occupied"
 * @prop {string} hotelID
 */
class Room {
  constructor({ roomNumber, type, status, hotelID }) {
    this.roomNumber = roomNumber;
    this.type = type;
    this.status = status;
    this.hotelID = hotelID;
  }
}

module.exports = Room;
