// models/Hotel.js
/**
 * @class Hotel
 * @prop {string} hotelID
 * @prop {string} name
 * @prop {number} starRating
 * @prop {string} address
 * @prop {number} totalRooms
 * @prop {string} description
 * @prop {string} phone
 * @prop {string} email
 * @prop {Object[]} availableServices - Array of service objects available at this hotel
 */
class Hotel {
  constructor({
    hotelID,
    name,
    starRating,
    address,
    totalRooms,
    description = "",
    phone = "",
    email = "",
    availableServices = [],
  }) {
    this.hotelID = hotelID;
    this.name = name;
    this.starRating = starRating;
    this.address = address;
    this.totalRooms = totalRooms;
    this.description = description;
    this.phone = phone;
    this.email = email;
    this.availableServices = availableServices;
  }
}

module.exports = Hotel;
