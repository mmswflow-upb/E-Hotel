// middleware/auth.js
const { admin } = require("../firebase");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const idToken = header.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      role: decoded.role || "Customer",
      assignedHotelIds: decoded.assignedHotelIds || [],
      managedHotelIds: decoded.managedHotelIds || [],
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
