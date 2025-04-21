/**
 * @class Service
 * @prop {string} serviceID
 * @prop {string} name
 * @prop {number} cost
 * @prop {boolean} isOneTime - true if service is charged once, false if charged per use
 * @prop {string} description
 */
class Service {
  constructor({ serviceID, name, cost, isOneTime, description }) {
    this.serviceID = serviceID;
    this.name = name;
    this.cost = cost;
    this.isOneTime = isOneTime;
    this.description = description;
  }
}

module.exports = Service;
