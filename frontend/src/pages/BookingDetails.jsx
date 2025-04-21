import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";
import approvedIcon from "../assets/approved.png";
import deniedIcon from "../assets/denied.png";
import invoiceIcon from "../assets/invoice.png";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
        if (res.data.hasInvoice) {
          try {
            const iv = await api.get(`/invoices/booking/${bookingId}`);
            setInvoice(iv.data);
          } catch {}
        }
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [bookingId]);

  async function cancel() {
    setErr("");
    setMsg("");
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setBooking({ ...booking, status: "canceled" });
      setMsg("Canceled.");
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err) return <p className="text-red-500 text-center">{err}</p>;
  if (!booking) return <p>Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Booking {booking.bookingID}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "booked"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : booking.status === "occupied"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : booking.status === "completed"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {booking.hotelDetails.name}
              </h3>
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
              {booking.hotelDetails.phone && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Phone:</span>{" "}
                  {booking.hotelDetails.phone}
                </p>
              )}
              {booking.hotelDetails.email && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Email:</span>{" "}
                  {booking.hotelDetails.email}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Rooms:
              </h4>
              <ul className="space-y-2">
                {booking.roomDetails.map((room, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <img
                      src={
                        room.type.toLowerCase().includes("double")
                          ? doubleBedRoomIcon
                          : bedRoomIcon
                      }
                      alt={room.type}
                      className="h-6 w-6 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    Room {room.roomNumber} ({room.type})
                  </li>
                ))}
              </ul>
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
                <span className="font-medium">Total:</span> $
                {booking.totalAmount}
              </p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <span className="font-medium">Payment Status:</span>
                <img
                  src={
                    booking.paymentStatus === "approved"
                      ? approvedIcon
                      : deniedIcon
                  }
                  alt={booking.paymentStatus}
                  className={`h-5 w-5 ${
                    booking.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : booking.paymentStatus === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
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
            {booking.status === "booked" && (
              <button
                onClick={cancel}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Booking
              </button>
            )}
            {booking.hasInvoice && (
              <Link
                to={`/bookings/${bookingId}/invoice`}
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
          {msg && <p className="mt-4 text-green-500 text-center">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
