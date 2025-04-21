import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import hotelIcon from "../assets/hotel.png";

export default function Home() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <img
              src={hotelIcon}
              alt="E-Hotels Logo"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              E‑Hotel
            </h1>
          </div>
        </div>

        {!user ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Book rooms at amazing hotels in seconds.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Welcome back, {user.displayName || user.email?.split("@")[0]}!
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/hotels"
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Browse hotels
              </Link>
              {role === "Customer" && (
                <Link
                  to="/my-bookings"
                  className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  My bookings
                </Link>
              )}
              {["Receptionist", "SystemAdmin"].includes(role) && (
                <Link
                  to="/reception"
                  className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Reception dashboard
                </Link>
              )}
              {["HotelManager", "SystemAdmin"].includes(role) && (
                <Link
                  to="/stats"
                  className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Monthly stats
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
