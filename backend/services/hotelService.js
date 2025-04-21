// services/hotelService.js
const { db } = require("../firebase");
const Hotel = require("../models/Hotel");

const hotelsCol = db.collection("hotels");

exports.listHotels = async ({
  includeAll = false,
  managerId,
  receptionistId,
} = {}) => {
  let query = hotelsCol;

  if (managerId) {
    // For managers, only show hotels they manage
    query = query.where("managerId", "==", managerId);
  } else if (receptionistId) {
    // For receptionists, only show hotels they're assigned to
    query = query.where("receptionistIds", "array-contains", receptionistId);
  }
  // For customers and unauthenticated users, show all hotels (no filter needed)

  try {
    const snap = await query.get();
    const hotels = snap.docs.map((d) => {
      const data = d.data();
      return new Hotel({
        hotelID: d.id,
        name: data.name || "Unnamed Hotel",
        starRating: data.starRating || 0,
        address: data.address || "No address",
        totalRooms: data.totalRooms || 0,
      });
    });
    console.log(`Found ${hotels.length} hotels`);
    return hotels;
  } catch (error) {
    console.error("Error fetching hotels:", error);
    throw error;
  }
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
