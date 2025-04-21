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
    <nav className="nav">
      <Link to="/hotels">Hotels</Link>
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          {["Tourist", "Customer"].includes(role) && (
            <Link to="/my-bookings">My bookings</Link>
          )}
          {["Receptionist", "SystemAdmin"].includes(role) && (
            <Link to="/reception">Reception</Link>
          )}
          {["HotelManager", "SystemAdmin"].includes(role) && (
            <Link to="/stats">Stats</Link>
          )}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
