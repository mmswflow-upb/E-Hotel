import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";
import scheduledIcon from "../assets/scheduled.png";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";
import approvedIcon from "../assets/approved.png";
import deniedIcon from "../assets/denied.png";
import invoiceIcon from "../assets/invoice.png";

export default function MyBookings() {
  const [bookings, setBookings] = useState({
    history: [],
    active: [],
    future: [],
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data);
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      }
    })();
  }, []);

  if (err) return <p className="text-red-500 text-center">{err}</p>;

  const BookingCard = ({ booking }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {booking.hotelDetails.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "booked"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : booking.status === "occupied"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : booking.status === "completed"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  : booking.status === "canceled"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {booking.status}
            </span>
          </div>
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
                booking.paymentStatus === "approved" ? approvedIcon : deniedIcon
              }
              alt={booking.paymentStatus}
              className={`h-5 w-5 ${
                booking.paymentStatus === "approved"
                  ? ""
                  : "dark:invert dark:brightness-0 dark:opacity-80"
              }`}
            />
            <span
              className={`px-2 py-1 rounded text-sm ${
                booking.paymentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : booking.paymentStatus === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {booking.paymentStatus}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link
          to={`/bookings/${booking.bookingID}`}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
        >
          View Details
        </Link>
        {booking.hasInvoice && (
          <Link
            to={`/bookings/${booking.bookingID}/invoice`}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center flex items-center justify-center gap-2"
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <img
              src={scheduledIcon}
              alt="My Bookings"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              My Bookings
            </h2>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Active Bookings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.active.length > 0 ? (
                bookings.active.map((booking) => (
                  <BookingCard key={booking.bookingID} booking={booking} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No active bookings
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Bookings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.future.length > 0 ? (
                bookings.future.map((booking) => (
                  <BookingCard key={booking.bookingID} booking={booking} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No upcoming bookings
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Booking History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.history.length > 0 ? (
                bookings.history.map((booking) => (
                  <BookingCard key={booking.bookingID} booking={booking} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No past bookings
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
