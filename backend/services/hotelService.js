// services/hotelService.js
const { db } = require("../firebase");
const Hotel = require("../models/Hotel");

const hotelsCol = db.collection("hotels");

exports.listHotels = async ({
  publicOnly = false,
  includeAll = false,
  managerId,
  receptionistId,
} = {}) => {
  let query = hotelsCol;

  if (publicOnly) {
    query = query.where("isPublic", "==", true);
  } else if (managerId) {
    query = query.where("managerId", "==", managerId);
  } else if (receptionistId) {
    query = query.where("receptionistIds", "array-contains", receptionistId);
  }

  const snap = await query.get();
  return snap.docs.map((d) => new Hotel({ hotelID: d.id, ...d.data() }));
};

exports.createHotel = async ({ name, address, starRating, totalRooms }) => {
  const ref = await hotelsCol.add({
    name,
    address,
    starRating,
    totalRooms,
    isPublic: true,
    managerId: null,
    receptionistIds: [],
  });
  const d = await ref.get();
  return new Hotel({ hotelID: d.id, ...d.data() });
};
