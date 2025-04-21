// models/CancellationRecord.js
/**
 * @class CancellationRecord
 * @prop {string} cancellationID
 * @prop {string} bookingID
 * @prop {Date} cancellationTime
 * @prop {number} penaltyApplied
 */
class CancellationRecord {
  constructor({ cancellationID, bookingID, cancellationTime, penaltyApplied }) {
    this.cancellationID = cancellationID;
    this.bookingID = bookingID;
    this.cancellationTime = cancellationTime;
    this.penaltyApplied = penaltyApplied;
  }
}

module.exports = CancellationRecord;
