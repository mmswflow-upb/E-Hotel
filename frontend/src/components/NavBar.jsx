import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import sunIcon from "../assets/sun.png";
import hotelIcon from "../assets/hotel.png";
import myBookingsIcon from "../assets/myBookings.png";
import profileIcon from "../assets/profile.png";
import fiveStarsIcon from "../assets/five-stars.png";
import statsIcon from "../assets/stats.png";
import requestIcon from "../assets/request.png";

export default function NavBar() {
  const { user, role } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const nav = useNavigate();

  async function logout() {
    await signOut(auth);
    nav("/login");
  }

  return (
    <nav className="bg-blue-900 dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={fiveStarsIcon}
                alt="E-Hotels Logo"
                className="h-12 w-12 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
              />
              <span className="text-3xl font-bold text-white dark:text-white">
                E-Hotels
              </span>
            </Link>
            {user && (
              <>
                {role === "Customer" && (
                  <Link
                    to="/hotels"
                    className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                  >
                    <img
                      src={hotelIcon}
                      alt="Hotels"
                      className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    Hotels
                  </Link>
                )}
                {role === "Customer" && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                  >
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    Profile
                  </Link>
                )}
                {role === "Customer" && (
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                  >
                    <img
                      src={myBookingsIcon}
                      alt="My Bookings"
                      className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    My bookings
                  </Link>
                )}
                {["Receptionist", "SystemAdmin"].includes(role) && (
                  <>
                    <Link
                      to="/reception"
                      className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                    >
                      <img
                        src={myBookingsIcon}
                        alt="Bookings"
                        className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Bookings
                    </Link>
                    <Link
                      to="/reception/cancellations"
                      className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                    >
                      <img
                        src={requestIcon}
                        alt="Requests"
                        className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Requests
                    </Link>
                  </>
                )}
                {["HotelManager", "SystemAdmin"].includes(role) && (
                  <>
                    <Link
                      to="/hotels"
                      className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                    >
                      <img
                        src={hotelIcon}
                        alt="Hotels"
                        className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Hotels
                    </Link>
                    <Link
                      to="/stats"
                      className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                    >
                      <img
                        src={statsIcon}
                        alt="Stats"
                        className="h-5 w-5 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Stats
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-white dark:text-white hover:text-blue-200 dark:hover:text-primary transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-blue-800 dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              <img
                src={sunIcon}
                alt="Theme toggle"
                className={`h-5 w-5 transition-transform duration-200 ${
                  isDarkMode
                    ? "rotate-180 invert brightness-0 dark:invert dark:brightness-0 dark:opacity-80"
                    : "invert brightness-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
