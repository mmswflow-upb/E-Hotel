// models/PaymentTransaction.js
/**
 * @class PaymentTransaction
 * @prop {string} transactionID
 * @prop {string} bookingID
 * @prop {number} amount
 * @prop {string} paymentMethod   // "cash" or "card"
 * @prop {Date} transactionDate
 * @prop {string} status          // "approved", "declined", or "pending"
 */
class PaymentTransaction {
  constructor({
    transactionID,
    bookingID,
    amount,
    paymentMethod,
    transactionDate,
    status,
  }) {
    this.transactionID = transactionID;
    this.bookingID = bookingID;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.transactionDate = transactionDate;
    this.status = status;
  }
}

module.exports = PaymentTransaction;
