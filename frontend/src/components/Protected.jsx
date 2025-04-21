import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Protected({
  roles = ["Customer", "Receptionist", "HotelManager", "SystemAdmin"],
  children,
}) {
  const { user, role, loading } = useAuth();
  console.log(
    "Protected route - User:",
    user?.email,
    "Role:",
    role,
    "Loading:",
    loading
  );

  if (loading) return <p className="center">Loading…</p>;
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const hasAccess = roles.includes(role);
  console.log(
    "Access check - Required roles:",
    roles,
    "User role:",
    role,
    "Has access:",
    hasAccess
  );

  return hasAccess ? children : <Navigate to="/" replace />;
}
