// services/hotelService.js
const { db } = require("../firebase");
const Hotel = require("../models/Hotel");

const hotelsCol = db.collection("hotels");

exports.listHotels = async () => {
  const snap = await hotelsCol.get();
  return snap.docs.map((d) => new Hotel({ hotelID: d.id, ...d.data() }));
};

exports.createHotel = async ({ name, address, starRating, totalRooms }) => {
  const ref = await hotelsCol.add({ name, address, starRating, totalRooms });
  const d = await ref.get();
  return new Hotel({ hotelID: d.id, ...d.data() });
};
