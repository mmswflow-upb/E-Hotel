// middleware/role.js
module.exports =
  (...allowedRoles) =>
  (req, res, next) => {
    const { role, assignedHotelIds, managedHotelIds } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden – insufficient role" });
    }
    // if this route is scoped to a hotel, enforce membership
    const { hotelId } = req.params;
    if (hotelId && role !== "SystemAdmin") {
      const pool = role === "HotelManager" ? managedHotelIds : assignedHotelIds;
      if (!pool.includes(hotelId)) {
        return res
          .status(403)
          .json({ error: "Forbidden – no access to this hotel" });
      }
    }
    next();
  };
