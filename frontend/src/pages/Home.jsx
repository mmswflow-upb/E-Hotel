import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, role } = useAuth();

  return (
    <div className="center">
      <h1>E‑Hotel</h1>
      {!user && (
        <>
          <p>Book rooms at amazing hotels in seconds.</p>
          <Link className="button" to="/login">
            Login
          </Link>{" "}
          <Link className="button" to="/register">
            Register
          </Link>
        </>
      )}

      {user && (
        <>
          <p>Welcome back, {user.displayName || user.email?.split("@")[0]}!</p>
          <ul className="card-list">
            <li className="card">
              <Link to="/hotels">Browse hotels</Link>
            </li>
            {role === "Customer" && (
              <li className="card">
                <Link to="/my-bookings">My bookings</Link>
              </li>
            )}
            {["Receptionist", "SystemAdmin"].includes(role) && (
              <li className="card">
                <Link to="/reception">Reception dashboard</Link>
              </li>
            )}
            {["HotelManager", "SystemAdmin"].includes(role) && (
              <li className="card">
                <Link to="/stats">Monthly stats</Link>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
