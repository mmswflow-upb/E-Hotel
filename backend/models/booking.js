// models/Booking.js
/**
 * @class Booking
 * @prop {string} bookingID
 * @prop {string} customerID
 * @prop {Room[]} roomDetails             // array of Room instances or plain objects
 * @prop {Date} checkInDate
 * @prop {Date} checkOutDate              // scheduled departure
 * @prop {Date=} checkedOutAt             // actual checkout timestamp
 * @prop {number} cancellationGracePeriod // in hours
 */
class Booking {
  constructor({
    bookingID,
    customerID,
    roomDetails,
    checkInDate,
    checkOutDate,
    checkedOutAt = null,
    cancellationGracePeriod,
  }) {
    this.bookingID = bookingID;
    this.customerID = customerID;
    this.roomDetails = roomDetails;
    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
    this.checkedOutAt = checkedOutAt;
    this.cancellationGracePeriod = cancellationGracePeriod;
  }
}

module.exports = Booking;
