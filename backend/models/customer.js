// models/Customer.js
/**
 * @class Customer
 * @prop {string} customerID
 * @prop {string} name
 * @prop {string} contactInfo    // e.g. email or phone
 * @prop {string} identification // e.g. CNP or passport
 * @prop {number} balance       // customer's account balance
 */
class Customer {
  constructor({ customerID, name, contactInfo, identification, balance = 0 }) {
    this.customerID = customerID;
    this.name = name;
    this.contactInfo = contactInfo;
    this.identification = identification;
    this.balance = Number(balance) || 0; // Ensure balance is always a number
  }
}

module.exports = Customer;
