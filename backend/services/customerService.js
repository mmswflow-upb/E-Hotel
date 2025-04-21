// services/customerService.js
const { db, admin } = require("../firebase");
const Customer = require("../models/customer");

const customersCol = db.collection("customers");

/**
 * Fetch a customer by their Firebase UID (we use the UID as the doc ID).
 */
exports.getCustomer = async (customerID) => {
  const doc = await customersCol.doc(customerID).get();
  if (!doc.exists) throw new Error("Customer not found");
  const d = doc.data();
  return new Customer({
    customerID: doc.id,
    name: d.name || "",
    phoneNumber: d.phoneNumber || "",
    idType: d.idType || "",
    idNumber: d.idNumber || "",
    balance: Number(d.balance) || 0,
  });
};

/**
 * Create or update (upsert) the customer profile for this UID.
 */
exports.createOrUpdateCustomer = async (
  customerID,
  { name, phoneNumber, idType, idNumber, balance }
) => {
  const payload = {
    name: name || "",
    phoneNumber: phoneNumber || "",
    idType: idType || "",
    idNumber: idNumber || "",
    balance: Number(balance) || 0,
    updatedAt: admin.firestore.Timestamp.now(),
  };
  await customersCol.doc(customerID).set(payload, { merge: true });
  return new Customer({
    customerID,
    name: name || "",
    phoneNumber: phoneNumber || "",
    idType: idType || "",
    idNumber: idNumber || "",
    balance: Number(balance) || 0,
  });
};

/**
 * List *all* customers. (For staff/system‑admin use.)
 */
exports.listCustomers = async () => {
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
};
