// models/Invoice.js
/**
 * @class Invoice
 * @prop {string} invoiceID
 * @prop {string} bookingID
 * @prop {string} hotelID
 * @prop {Object[]} roomCharges - Array of room charges with usage details
 * @prop {Object[]} serviceCharges - Array of service charges with usage details
 * @prop {number} totalAmount
 * @prop {Date} issueDate
 * @prop {string} status - 'pending', 'paid', 'cancelled'
 */
class Invoice {
  constructor({
    invoiceID,
    bookingID,
    hotelID,
    roomCharges = [],
    serviceCharges = [],
    totalAmount,
    issueDate,
    status = "pending",
  }) {
    this.invoiceID = invoiceID;
    this.bookingID = bookingID;
    this.hotelID = hotelID;
    this.roomCharges = roomCharges;
    this.serviceCharges = serviceCharges;
    this.totalAmount = totalAmount;
    this.issueDate = issueDate;
    this.status = status;
  }
}

module.exports = Invoice;
