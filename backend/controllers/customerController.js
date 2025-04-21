// controllers/customerController.js
const customerSvc = require("../services/customerService");

exports.getMe = async (req, res) => {
  try {
    const cust = await customerSvc.getCustomer(req.user.uid);
    res.json(cust);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, contactInfo, identification, balance } = req.body;
    const updated = await customerSvc.createOrUpdateCustomer(req.user.uid, {
      name,
      contactInfo,
      identification,
      balance,
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.list = async (req, res) => {
  const list = await customerSvc.listCustomers();
  res.json(list);
};

exports.getById = async (req, res) => {
  try {
    const cust = await customerSvc.getCustomer(req.params.customerID);
    res.json(cust);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};
