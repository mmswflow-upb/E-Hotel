// services/customerService.js
const { db, admin } = require("../firebase");
const Customer = require("../models/Customer");

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
    name: d.name,
    contactInfo: d.contactInfo,
    identification: d.identification,
    balance: Number(d.balance) || 0,
  });
};

/**
 * Create or update (upsert) the customer profile for this UID.
 */
exports.createOrUpdateCustomer = async (
  customerID,
  { name, contactInfo, identification, balance }
) => {
  const payload = {
    name,
    contactInfo,
    identification,
    balance: Number(balance) || 0,
    updatedAt: admin.firestore.Timestamp.now(),
  };
  await customersCol.doc(customerID).set(payload, { merge: true });
  return new Customer({
    customerID,
    name,
    contactInfo,
    identification,
    balance,
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
      name: d.name,
      contactInfo: d.contactInfo,
      identification: d.identification,
      balance: Number(d.balance) || 0,
    });
  });
};
