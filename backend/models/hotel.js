// models/Hotel.js
/**
 * @class Hotel
 * @prop {string} hotelID
 * @prop {string} name
 * @prop {number} starRating
 * @prop {string} address
 * @prop {number} totalRooms
 */
class Hotel {
  constructor({ hotelID, name, starRating, address, totalRooms }) {
    this.hotelID = hotelID;
    this.name = name;
    this.starRating = starRating;
    this.address = address;
    this.totalRooms = totalRooms;
  }
}

module.exports = Hotel;
