// controllers/customerController.js
const customerSvc = require("../services/customerService");

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const cust = await customerSvc.getCustomer(req.user.uid);
    res.json(cust);
  } catch (e) {
    console.error("Error in getMe:", e);
    res.status(404).json({ error: e.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phoneNumber, idType, idNumber, balance } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updated = await customerSvc.createOrUpdateCustomer(req.user.uid, {
      name,
      phoneNumber: phoneNumber || "",
      idType: idType || "",
      idNumber: idNumber || "",
      balance: Number(balance) || 0,
    });
    res.json(updated);
  } catch (e) {
    console.error("Error in updateMe:", e);
    res.status(400).json({ error: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const list = await customerSvc.listCustomers();
    res.json(list);
  } catch (e) {
    console.error("Error in list:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    if (!req.params.customerID) {
      return res.status(400).json({ error: "Customer ID is required" });
    }
    const cust = await customerSvc.getCustomer(req.params.customerID);
    res.json(cust);
  } catch (e) {
    console.error("Error in getById:", e);
    res.status(404).json({ error: e.message });
  }
};
