// models/Invoice.js
/**
 * @class Invoice
 * @prop {string} invoiceID
 * @prop {string} bookingID
 * @prop {string[]} itemizedCharges // e.g. ["Room: $100", "Breakfast: $10"]
 * @prop {number} totalAmount
 * @prop {Date} issueDate
 */
class Invoice {
  constructor({
    invoiceID,
    bookingID,
    itemizedCharges,
    totalAmount,
    issueDate,
  }) {
    this.invoiceID = invoiceID;
    this.bookingID = bookingID;
    this.itemizedCharges = itemizedCharges;
    this.totalAmount = totalAmount;
    this.issueDate = issueDate;
  }
}

module.exports = Invoice;
