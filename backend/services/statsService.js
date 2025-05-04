// services/statsService.js
const { db } = require("../firebase");
const StatisticsReport = require("../models/statisticsReport");

const bookingsCol = db.collection("bookings");
const cancelsCol = db.collection("cancellations");

exports.monthlyStats = async (hotelId, year, month) => {
  const snaps = await bookingsCol.where("hotelID", "==", hotelId).get();
  const all = snaps.docs.map((d) => {
    const dta = d.data();
    return {
      createdAt: dta.createdAt.toDate(),
      status: dta.status,
      totalAmount: dta.totalAmount,
    };
  });

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const inPeriod = all.filter((b) => b.createdAt >= start && b.createdAt < end);

  const totalRevenue = inPeriod
    .filter((b) => b.status === "checked-out")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const bookingsCount = inPeriod.length;
  const completedCount = inPeriod.filter(
    (b) => b.status === "checked-out"
  ).length;
  const occupancyRate = bookingsCount ? completedCount / bookingsCount : 0;

  const cSnap = await cancelsCol.where("hotelID", "==", hotelId).get();
  const cancelCount = cSnap.docs
    .map((d) => d.data().cancellationTime.toDate())
    .filter((d) => d >= start && d < end).length;

  return new StatisticsReport({
    reportID: `${hotelId}-${year}${month.toString().padStart(2, "0")}`,
    hotelID,
    period: `${year}-${month.toString().padStart(2, "0")}`,
    totalRevenue,
    occupancyRate,
    cancellationCount: cancelCount,
  });
};
