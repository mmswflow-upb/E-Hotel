/**
 * @class Customer
 * @prop {string} customerID
 * @prop {string} name
 * @prop {string} phoneNumber    // customer's phone number
 * @prop {string} idType         // type of identification (passport, id_card, driver_license)
 * @prop {string} idNumber       // identification number
 * @prop {number} balance        // customer's account balance
 */
class Customer {
  constructor({
    customerID,
    name,
    phoneNumber,
    idType,
    idNumber,
    balance = 0,
  }) {
    if (!customerID) throw new Error("Customer ID is required");
    if (!name) throw new Error("Name is required");
    if (!phoneNumber) throw new Error("Phone number is required");
    if (!idType) throw new Error("ID type is required");
    if (!idNumber) throw new Error("ID number is required");

    this.customerID = customerID;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.idType = idType;
    this.idNumber = idNumber;
    this.balance = balance;
  }

  toJSON() {
    return {
      customerID: this.customerID,
      name: this.name,
      phoneNumber: this.phoneNumber,
      idType: this.idType,
      idNumber: this.idNumber,
      balance: this.balance,
    };
  }
}

module.exports = Customer;
