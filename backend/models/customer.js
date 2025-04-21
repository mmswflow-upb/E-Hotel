// models/Customer.js
/**
 * @class Customer
 * @prop {string} customerID
 * @prop {string} name
 * @prop {string} contactInfo    // e.g. email or phone
 * @prop {string} identification // e.g. CNP or passport
 */
class Customer {
  constructor({ customerID, name, contactInfo, identification }) {
    this.customerID = customerID;
    this.name = name;
    this.contactInfo = contactInfo;
    this.identification = identification;
  }
}

module.exports = Customer;
