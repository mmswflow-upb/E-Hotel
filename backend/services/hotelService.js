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
}) => {
  const ref = await hotelsCol.add({
    name,
    address,
    starRating,
    totalRooms,
    description,
    isPublic: true,
    managerId: null,
    receptionistIds: [],
  });
  const d = await ref.get();
  return new Hotel({ hotelID: d.id, ...d.data() });
};

exports.getHotelById = async (hotelId) => {
  try {
    const doc = await hotelsCol.doc(hotelId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();

    // Create the hotel object
    const hotel = new Hotel({
      hotelID: doc.id,
      name: data.name || "Unnamed Hotel",
      starRating: data.starRating || 0,
      address: data.address || "No address",
      totalRooms: data.totalRooms || 0,
      description: data.description || "",
      amenities: data.amenities || [],
      image: data.image || null,
      serviceIDs: data.availableServiceIDs || [],
    });

    // Fetch services using the hotel's availableServiceIDs
    const availableServices = [];
    if (hotel.serviceIDs.length > 0) {
      const servicePromises = hotel.serviceIDs.map(async (serviceId) => {
        try {
          const serviceDoc = await servicesCol.doc(serviceId).get();
          if (serviceDoc.exists) {
            const serviceData = serviceDoc.data();
            return new Service({
              serviceID: serviceDoc.id,
              name: serviceData.name,
              cost: serviceData.cost,
              isOneTime: serviceData.isOneTime,
              description: serviceData.description,
            });
          }
          console.warn(`Service with ID ${serviceId} not found`);
          return null;
        } catch (error) {
          console.error(`Error fetching service ${serviceId}:`, error);
          return null;
        }
      });

      // Wait for all service fetches to complete and filter out any null results
      const serviceResults = await Promise.all(servicePromises);
      availableServices.push(
        ...serviceResults.filter((service) => service !== null)
      );
    }

    // Return the hotel data with availableServices
    return {
      hotelID: hotel.hotelID,
      name: hotel.name,
      starRating: hotel.starRating,
      address: hotel.address,
      totalRooms: hotel.totalRooms,
      description: hotel.description,
      amenities: hotel.amenities,
      image: hotel.image,
      availableServices: availableServices,
    };
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    throw error;
  }
};
