import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import approvedIcon from "../assets/approved.png";
import deniedIcon from "../assets/denied.png";
import invoiceIcon from "../assets/invoice.png";
import waitingIcon from "../assets/waiting.png";
import ErrorToast from "./ErrorToast";
import { useCustomer } from "../hooks/useCustomer";

export default function BookingCard({ booking }) {
  const [errorMsg, setErrorMsg] = useState("");
  const { role } = useAuth();
  const {
    customer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(booking.customerID);

  // Check if user is staff
  const isStaff = ["Receptionist", "HotelManager", "SystemAdmin"].includes(
    role
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200">
      <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />
      {customerError && isStaff && (
        <ErrorToast message={customerError} onClose={() => {}} />
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {booking.hotelDetails.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "booked"
                  ? "bg-primary text-white dark:bg-primary-dark"
                  : booking.status === "checked-in"
                  ? "bg-primary text-white dark:bg-primary-dark"
                  : booking.status === "checked-out"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {booking.status}
            </span>
          </div>
          {isStaff && !customerLoading && customer && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Customer:</span> {customer.name}
              </p>
              {customer.email && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Email:</span> {customer.email}
                </p>
              )}
              {customer.phoneNumber && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Phone:</span>{" "}
                  {customer.phoneNumber}
                </p>
              )}
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Rating:</span>{" "}
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`text-xl ${
                  index < booking.hotelDetails.starRating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                ★
              </span>
            ))}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Address:</span>{" "}
            {booking.hotelDetails.address}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Check-in:</span>{" "}
            {new Date(booking.checkInDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Check-out:</span>{" "}
            {new Date(booking.checkOutDate).toLocaleDateString()}
          </p>
          {booking.checkedOutAt && (
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Checked out:</span>{" "}
              {new Date(booking.checkedOutAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Total:</span> ${booking.totalAmount}
          </p>
          <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <span className="font-medium">Payment Status:</span>
            <img
              src={
                booking.paymentStatus === "approved" ||
                booking.paymentStatus === "refunded" ||
                booking.paymentStatus === "penalties paid" ||
                booking.paymentStatus === "no penalties"
                  ? approvedIcon
                  : booking.paymentStatus === "waiting"
                  ? waitingIcon
                  : deniedIcon
              }
              alt={booking.paymentStatus}
              className={`h-5 w-5 ${
                booking.paymentStatus === "pending" ||
                booking.paymentStatus === "insufficient_funds" ||
                booking.paymentStatus === "waiting"
                  ? "dark:invert dark:brightness-0 dark:opacity-80"
                  : booking.paymentStatus === "approved" ||
                    booking.paymentStatus === "refunded" ||
                    booking.paymentStatus === "penalties paid" ||
                    booking.paymentStatus === "no penalties"
                  ? ""
                  : "dark:invert dark:brightness-0 dark:opacity-80"
              }`}
            />
            <span
              className={`px-2 py-1 rounded text-sm ${
                booking.paymentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : booking.paymentStatus === "insufficient_funds" ||
                    booking.paymentStatus === "waiting"
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  : booking.paymentStatus === "approved" ||
                    booking.paymentStatus === "refunded" ||
                    booking.paymentStatus === "penalties paid" ||
                    booking.paymentStatus === "no penalties"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {booking.paymentStatus === "insufficient_funds"
                ? "Insufficient Funds"
                : booking.paymentStatus}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link
          to={`/bookings/${booking.bookingID}`}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark text-center"
        >
          View Details
        </Link>
        {booking.hasInvoice && (
          <Link
            to={`/bookings/${booking.bookingID}/invoice`}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark text-center flex items-center justify-center gap-2"
          >
            <img
              src={invoiceIcon}
              alt="Invoice"
              className="h-5 w-5 invert brightness-0 opacity-80"
            />
            View Invoice
          </Link>
        )}
      </div>
    </div>
  );
}
