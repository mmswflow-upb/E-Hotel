// models/StatisticsReport.js
/**
 * @class StatisticsReport
 * @prop {string} reportID
 * @prop {string} hotelID
 * @prop {string} period           // e.g. '2025-04'
 * @prop {number} totalRevenue
 * @prop {number} occupancyRate    // e.g. 0.75 for 75%
 * @prop {number} cancellationCount
 */
class StatisticsReport {
  constructor({
    reportID,
    hotelID,
    period,
    totalRevenue,
    occupancyRate,
    cancellationCount,
  }) {
    this.reportID = reportID;
    this.hotelID = hotelID;
    this.period = period;
    this.totalRevenue = totalRevenue;
    this.occupancyRate = occupancyRate;
    this.cancellationCount = cancellationCount;
  }
}

module.exports = StatisticsReport;
