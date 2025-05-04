// controllers/customerController.js
const customerSvc = require("../services/customerService");

exports.getMe = async (req, res) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await customerSvc.getCustomer(req.user.uid);
  if (result && result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
};

exports.updateMe = async (req, res) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, phoneNumber, idType, idNumber, balance } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const result = await customerSvc.createOrUpdateCustomer(req.user.uid, {
    name,
    phoneNumber: phoneNumber || "",
    idType: idType || "",
    idNumber: idNumber || "",
    balance: Number(balance) || 0,
  });

  if (result && result.error) {
    if (result.error.includes("not found")) {
      return res.status(404).json({ error: result.error });
    } else if (result.error.includes("insufficient")) {
      return res.status(402).json({ error: result.error });
    }
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
};

exports.list = async (req, res) => {
  const result = await customerSvc.listCustomers();
  if (result && result.error) {
    return res.status(500).json({ error: result.error });
  }
  res.json(result);
};

exports.getById = async (req, res) => {
  if (!req.params.customerID) {
    return res.status(400).json({ error: "Customer ID is required" });
  }
  const result = await customerSvc.getCustomer(req.params.customerID);
  if (result && result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
};
