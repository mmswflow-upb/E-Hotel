import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export default function Footer() {
  const { isDarkMode } = useTheme();
  const { user, role } = useAuth();

  return (
    <footer
      className={`py-8 ${
        isDarkMode ? "bg-gray-800" : "bg-blue-900"
      } shadow-inner`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">
              E-Hotels
            </h3>
            <p className="text-blue-100 dark:text-gray-300">
              Your premier destination for luxury accommodations and exceptional
              service.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              {!user ? (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  {role === "Customer" && (
                    <>
                      <li>
                        <Link
                          to="/hotels"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Hotels
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/my-bookings"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          My Bookings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/profile"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Profile
                        </Link>
                      </li>
                    </>
                  )}
                  {["HotelManager", "SystemAdmin"].includes(role) && (
                    <>
                      <li>
                        <Link
                          to="/hotels"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Manage Hotels
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/stats"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Stats
                        </Link>
                      </li>
                    </>
                  )}
                  {["Receptionist", "SystemAdmin"].includes(role) && (
                    <>
                      <li>
                        <Link
                          to="/reception"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Bookings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/reception/cancellations"
                          className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                        >
                          Requests
                        </Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-blue-100 dark:text-gray-300 hover:text-blue-200 dark:hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="text-blue-100 dark:text-gray-300">
                Email: support@ehotels.com
              </li>
              <li className="text-blue-100 dark:text-gray-300">
                Phone: +1 (555) 123-4567
              </li>
              <li className="text-blue-100 dark:text-gray-300">
                Address: 123 Hotel Street, Suite 100
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-700 dark:border-gray-700">
          <p className="text-center text-blue-100 dark:text-gray-300">
            © {new Date().getFullYear()} mmswflow
          </p>
        </div>
      </div>
    </footer>
  );
}
