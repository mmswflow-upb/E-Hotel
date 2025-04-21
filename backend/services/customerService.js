// services/customerService.js
const { db, admin } = require("../firebase");
const Customer = require("../models/customer");

const customersCol = db.collection("customers");

/**
 * Fetch a customer by their Firebase UID (we use the UID as the doc ID).
 */
exports.getCustomer = async (customerID) => {
  try {
    const doc = await customersCol.doc(customerID).get();
    if (!doc.exists) return { error: "Customer not found" };
    const d = doc.data();
    return new Customer({
      customerID: doc.id,
      name: d.name || "",
      phoneNumber: d.phoneNumber || "",
      idType: d.idType || "",
      idNumber: d.idNumber || "",
      balance: Number(d.balance) || 0,
    });
  } catch (e) {
    return { error: e.message };
  }
};

/**
 * Create or update (upsert) the customer profile for this UID.
 */
exports.createOrUpdateCustomer = async (
  customerID,
  { name, phoneNumber, idType, idNumber, balance }
) => {
  try {
    // Validate required fields
    if (!name) return { error: "Name is required" };
    if (!phoneNumber) return { error: "Phone number is required" };
    if (!idType) return { error: "ID type is required" };
    if (!idNumber) return { error: "ID number is required" };

    const payload = {
      name,
      phoneNumber,
      idType,
      idNumber,
      balance: Number(balance) || 0,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    await customersCol.doc(customerID).set(payload, { merge: true });
    return new Customer({
      customerID,
      name,
      phoneNumber,
      idType,
      idNumber,
      balance: Number(balance) || 0,
    });
  } catch (e) {
    return { error: e.message };
  }
};

/**
 * List *all* customers. (For staff/system‑admin use.)
 */
exports.listCustomers = async () => {
  try {
    const snap = await customersCol.get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return new Customer({
        customerID: doc.id,
        name: d.name || "",
        phoneNumber: d.phoneNumber || "",
        idType: d.idType || "",
        idNumber: d.idNumber || "",
        balance: Number(d.balance) || 0,
      });
    });
  } catch (e) {
    return { error: e.message };
  }
};
