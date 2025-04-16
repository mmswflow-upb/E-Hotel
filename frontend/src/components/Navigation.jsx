// frontend/src/components/Navigation.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { auth } from "../firebase";

const Navigation = () => {
  const { user, role } = useAuth();
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {user ? (
          <>
            {role === "tourist" && (
              <li>
                <Link to="/tourist">Tourist Dashboard</Link>
              </li>
            )}
            {role === "receptionist" && (
              <li>
                <Link to="/receptionist">Receptionist Dashboard</Link>
              </li>
            )}
            {role === "hotel_manager" && (
              <li>
                <Link to="/manager">Manager Dashboard</Link>
              </li>
            )}
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
