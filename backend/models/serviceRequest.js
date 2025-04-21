// models/ServiceRequest.js
/**
 * @class ServiceRequest
 * @prop {string} serviceID
 * @prop {string} bookingID
 * @prop {string} serviceType    // "breakfast", "dinner", or "internet"
 * @prop {number} price
 */
class ServiceRequest {
  constructor({ serviceID, bookingID, serviceType, price }) {
    this.serviceID = serviceID;
    this.bookingID = bookingID;
    this.serviceType = serviceType;
    this.price = price;
  }
}

module.exports = ServiceRequest;
