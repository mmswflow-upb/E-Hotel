import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Protected({
  roles = ["Tourist", "Receptionist", "HotelManager", "SystemAdmin"],
  children,
}) {
  const { user, role, loading } = useAuth();
  if (loading) return <p className="center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(role) ? children : <Navigate to="/" replace />;
}
