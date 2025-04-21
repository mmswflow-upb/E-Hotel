const { db } = require("../firebase");
const Service = require("../models/service");

class ServiceController {
  static async getAllServices() {
    try {
      const snapshot = await db.collection("services").get();
      return snapshot.docs.map(
        (doc) => new Service({ serviceID: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  static async getServiceById(serviceID) {
    try {
      const doc = await db.collection("services").doc(serviceID).get();
      if (!doc.exists) {
        throw new Error("Service not found");
      }
      return new Service({ serviceID: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Error fetching service: ${error.message}`);
    }
  }

  static async getServicesByHotel(hotelID) {
    try {
      const hotelDoc = await db.collection("hotels").doc(hotelID).get();
      if (!hotelDoc.exists) {
        throw new Error("Hotel not found");
      }

      const hotel = hotelDoc.data();
      const services = [];

      for (const serviceID of hotel.availableServiceIDs) {
        const serviceDoc = await db.collection("services").doc(serviceID).get();
        if (serviceDoc.exists) {
          services.push(
            new Service({ serviceID: serviceDoc.id, ...serviceDoc.data() })
          );
        }
      }

      return services;
    } catch (error) {
      throw new Error(`Error fetching hotel services: ${error.message}`);
    }
  }

  static async createService(serviceData) {
    try {
      const docRef = await db.collection("services").add(serviceData);
      return new Service({ serviceID: docRef.id, ...serviceData });
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  static async updateService(serviceID, serviceData) {
    try {
      await db.collection("services").doc(serviceID).update(serviceData);
      return new Service({ serviceID, ...serviceData });
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  static async deleteService(serviceID) {
    try {
      await db.collection("services").doc(serviceID).delete();
      return { message: "Service deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }
}

module.exports = ServiceController;
