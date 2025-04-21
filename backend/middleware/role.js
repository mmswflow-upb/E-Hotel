// middleware/role.js
module.exports =
  (...allowedRoles) =>
  (req, res, next) => {
    // If no roles specified, allow public access
    if (allowedRoles.length === 0) {
      return next();
    }

    // If user is not authenticated, only allow public routes
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { role, assignedHotelIds, managedHotelIds } = req.user;

    // Check if user's role is allowed
    if (
      !allowedRoles.includes(role) &&
      !(role === "Customer" && allowedRoles.includes("Tourist"))
    ) {
      return res.status(403).json({ error: "Forbidden – insufficient role" });
    }

    // For hotel-scoped routes, check hotel access
    const { hotelId } = req.params;
    if (hotelId) {
      // SystemAdmin has access to all hotels
      if (role === "SystemAdmin") {
        return next();
      }

      // HotelManager checks managed hotels
      if (role === "HotelManager" && managedHotelIds.includes(hotelId)) {
        return next();
      }

      // Receptionist, Customer and Tourist can view all hotels
      if (
        role === "Receptionist" ||
        role === "Customer" ||
        role === "Tourist"
      ) {
        return next();
      }

      // If none of the above conditions are met, deny access
      return res
        .status(403)
        .json({ error: "Forbidden – no access to this hotel" });
    }

    next();
  };
