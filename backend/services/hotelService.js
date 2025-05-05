// services/hotelService.js
const { db } = require("../firebase");
const Hotel = require("../models/hotel");
const Service = require("../models/service");

const hotelsCol = db.collection("hotels");
const servicesCol = db.collection("services");

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

exports.createHotel = async ({
  name,
  address,
  starRating,
  totalRooms,
  description = "",
  phone = "",
  email = "",
}) => {
  const ref = await hotelsCol.add({
    name,
    address,
    starRating,
    totalRooms,
    description,
    phone,
    email,
    isPublic: true,
    managerId: null,
    receptionistIds: [],
  });
  const d = await ref.get();
  return new Hotel({ hotelID: d.id, ...d.data() });
};

exports.getHotels = async () => {
  try {
    const snap = await hotelsCol.get();
    return snap.docs.map((d) => {
      const data = d.data();
      return new Hotel({
        hotelID: d.id,
        name: data.name,
        address: data.address,
        starRating: data.starRating,
        phone: data.phone || "",
        email: data.email || "",
      });
    });
  } catch (error) {
    throw error;
  }
};

exports.getServiceById = async (serviceId) => {
  try {
    const doc = await servicesCol.doc(serviceId).get();
    if (!doc.exists) throw new Error("Service not found");
    const data = doc.data();
    return new Service({
      serviceID: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
    });
  } catch (error) {
    throw error;
  }
};

exports.getHotelById = async (hotelId) => {
  try {
    const doc = await hotelsCol.doc(hotelId).get();
    if (!doc.exists) throw new Error("Hotel not found");
    const data = doc.data();

    // Fetch the actual service objects
    const availableServices = [];
    if (data.availableServiceIDs && data.availableServiceIDs.length > 0) {
      for (const serviceId of data.availableServiceIDs) {
        try {
          const serviceDoc = await servicesCol.doc(serviceId).get();
          if (serviceDoc.exists) {
            const serviceData = serviceDoc.data();
            availableServices.push({
              serviceID: serviceId,
              name: serviceData.name,
              description: serviceData.description,
              cost: serviceData.cost,
              isOneTime: serviceData.isOneTime,
            });
          }
        } catch (error) {
          console.error(`Error fetching service ${serviceId}:`, error);
        }
      }
    }

    return new Hotel({
      hotelID: doc.id,
      name: data.name,
      address: data.address,
      starRating: data.starRating,
      phone: data.phone || "",
      email: data.email || "",
      description: data.description || "",
      availableServices,
    });
  } catch (error) {
    throw error;
  }
};
