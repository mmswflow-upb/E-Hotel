import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import hotelIcon from "../assets/hotel.png";
import myBookingsIcon from "../assets/myBookings.png";
import profileIcon from "../assets/profile.png";
import statsIcon from "../assets/stats.png";

export default function Home() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {!user ? (
          <div className="mt-8 space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Welcome to E-Hotels
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Book rooms at amazing hotels in seconds
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Experience luxury accommodations and exceptional service
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <p className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user.displayName || user.email?.split("@")[0]}!
            </p>
            <div className="grid grid-cols-1 gap-4">
              {role === "Customer" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discover and book rooms at our premium hotels
                  </p>
                  <Link
                    to="/hotels"
                    className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <img
                      src={hotelIcon}
                      alt="Hotels"
                      className="h-6 w-6 mr-2 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    Browse hotels
                  </Link>
                </div>
              )}
              {role === "Customer" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage your upcoming and past bookings
                  </p>
                  <Link
                    to="/my-bookings"
                    className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <img
                      src={myBookingsIcon}
                      alt="My Bookings"
                      className="h-6 w-6 mr-2 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    My bookings
                  </Link>
                </div>
              )}
              {role === "Customer" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your personal information and preferences
                  </p>
                  <Link
                    to="/profile"
                    className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-6 w-6 mr-2 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    Profile
                  </Link>
                </div>
              )}
              {["Receptionist", "SystemAdmin"].includes(role) && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage bookings, check-ins, check-outs, and guest services
                    </p>
                    <Link
                      to="/reception"
                      className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      Manage Bookings
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Handle booking cancellation requests and process refunds
                    </p>
                    <Link
                      to="/reception/cancellations"
                      className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      Manage Requests
                    </Link>
                  </div>
                </>
              )}
              {["HotelManager", "SystemAdmin"].includes(role) && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage hotel operations, rooms, and services
                    </p>
                    <Link
                      to="/hotels"
                      className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <img
                        src={hotelIcon}
                        alt="Hotels"
                        className="h-6 w-6 mr-2 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Manage Hotels
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View hotel performance metrics and analytics
                    </p>
                    <Link
                      to="/stats"
                      className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <img
                        src={statsIcon}
                        alt="Stats"
                        className="h-6 w-6 mr-2 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Monthly Stats
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
