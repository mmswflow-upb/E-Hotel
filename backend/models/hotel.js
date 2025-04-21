// models/Hotel.js
/**
 * @class Hotel
 * @prop {string} hotelID
 * @prop {string} name
 * @prop {number} starRating
 * @prop {string} address
 * @prop {number} totalRooms
 * @prop {string} description
 * @prop {string[]} serviceIDs - Array of service IDs available at this hotel
 */
class Hotel {
  constructor({
    hotelID,
    name,
    starRating,
    address,
    totalRooms,
    description = "",
    serviceIDs = [],
  }) {
    this.hotelID = hotelID;
    this.name = name;
    this.starRating = starRating;
    this.address = address;
    this.totalRooms = totalRooms;
    this.description = description;
    this.serviceIDs = serviceIDs;
  }
}

module.exports = Hotel;
