// models/Booking.js
/**
 * @class Booking
 * @prop {string} bookingID
 * @prop {string} customerID
 * @prop {Object} hotelDetails           // hotel name, address, star rating
 * @prop {Room[]} roomDetails            // array of Room instances or plain objects
 * @prop {Date} checkInDate
 * @prop {Date} checkOutDate             // scheduled departure
 * @prop {Date=} checkedOutAt            // actual checkout timestamp
 * @prop {number} cancellationGracePeriod // in hours
 * @prop {number} totalAmount
 * @prop {string} status                 // booked, checked-in, checked-out, cancelled
 * @prop {string} paymentStatus          // pending, approved, declined
 * @prop {boolean} hasInvoice
 * @prop {Date} createdAt
 */
class Booking {
  constructor({
    bookingID,
    customerID,
    hotelDetails,
    roomDetails,
    checkInDate,
    checkOutDate,
    checkedOutAt = null,
    cancellationGracePeriod,
    totalAmount,
    status,
    paymentStatus,
    hasInvoice,
    createdAt,
  }) {
    this.bookingID = bookingID;
    this.customerID = customerID;
    this.hotelDetails = hotelDetails;
    this.roomDetails = roomDetails;
    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
    this.checkedOutAt = checkedOutAt;
    this.cancellationGracePeriod = cancellationGracePeriod;
    this.totalAmount = totalAmount;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.hasInvoice = hasInvoice;
    this.createdAt = createdAt;
  }
}

module.exports = Booking;
