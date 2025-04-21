import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Footer() {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`py-8 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-inner`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              E-Hotels
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your premier destination for luxury accommodations and exceptional
              service.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/hotels"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">
                Email: support@ehotels.com
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                Phone: +1 (555) 123-4567
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                Address: 123 Hotel Street, Suite 100
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} E-Hotels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
