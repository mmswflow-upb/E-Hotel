import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const { user, role } = useAuth();
  const nav = useNavigate();
  async function logout() {
    await signOut(auth);
    nav("/login");
  }

  return (
    <nav className="flex items-center gap-4 p-4 bg-secondary">
      <Link
        to="/hotels"
        className="text-white hover:text-primary transition-colors duration-200"
      >
        Hotels
      </Link>
      {user ? (
        <>
          {role === "Customer" && (
            <Link
              to="/profile"
              className="text-white hover:text-primary transition-colors duration-200"
            >
              Profile
            </Link>
          )}
          {role === "Customer" && (
            <Link
              to="/my-bookings"
              className="text-white hover:text-primary transition-colors duration-200"
            >
              My bookings
            </Link>
          )}
          {["Receptionist", "SystemAdmin"].includes(role) && (
            <Link
              to="/reception"
              className="text-white hover:text-primary transition-colors duration-200"
            >
              Reception
            </Link>
          )}
          {["HotelManager", "SystemAdmin"].includes(role) && (
            <Link
              to="/stats"
              className="text-white hover:text-primary transition-colors duration-200"
            >
              Stats
            </Link>
          )}
          <button
            onClick={logout}
            className="text-white hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-white hover:text-primary transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-white hover:text-primary transition-colors duration-200"
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
