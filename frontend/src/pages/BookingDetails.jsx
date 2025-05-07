import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { useAuth } from "../contexts/AuthContext";
import { useCustomer } from "../hooks/useCustomer";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";
import approvedIcon from "../assets/approved.png";
import deniedIcon from "../assets/denied.png";
import invoiceIcon from "../assets/invoice.png";
import waitingIcon from "../assets/waiting.png";
import mapPinIcon from "../assets/map-pin.png";
import phoneIcon from "../assets/phone-call.png";
import emailIcon from "../assets/email.png";
import profileIcon from "../assets/profile.png";
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { showLoading, hideLoading } = useLoading();
  const { role } = useAuth();
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // The useCustomer hook will only fetch data if the user is staff
  const {
    customer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(booking?.customerID);

  // Check if user is staff
  const isStaff = ["Receptionist", "HotelManager", "SystemAdmin"].includes(
    role
  );

  useEffect(() => {
    (async () => {
      try {
        showLoading();
        // First get all hotels
        const hotelsResponse = await api.get("/hotels");
        const hotels = hotelsResponse.data;

        // Search for the booking in each hotel
        let foundBooking = null;
        for (const hotel of hotels) {
          try {
            const response = await api.get(
              `/hotels/${hotel.hotelID}/bookings/${bookingId}`
            );
            if (response.data) {
              foundBooking = response.data;
              break;
            }
          } catch (error) {
            // Continue to next hotel if booking not found
            continue;
          }
        }

        if (!foundBooking) {
          throw new Error("Booking not found");
        }

        setBooking(foundBooking);
        if (foundBooking.hasInvoice) {
          try {
            const iv = await api.get(`/invoices/booking/${bookingId}`);
            setInvoice(iv.data);
          } catch {}
        }
      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        hideLoading();
      }
    })();
  }, [bookingId]);

  async function cancel() {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      showLoading();
      // First get all hotels
      const hotelsResponse = await api.get("/hotels");
      const hotels = hotelsResponse.data;

      // Find the hotel that has this booking
      let hotelId = null;
      for (const hotel of hotels) {
        try {
          const response = await api.get(
            `/hotels/${hotel.hotelID}/bookings/${bookingId}`
          );
          if (response.data) {
            hotelId = hotel.hotelID;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!hotelId) {
        throw new Error("Booking not found");
      }

      await api.post(`/hotels/${hotelId}/bookings/${bookingId}/cancel`);
      setBooking({ ...booking, status: "canceled" });
      setSuccessMsg("Booking cancelled successfully.");
    } catch (e) {
      if (e.response?.data?.error?.includes("Insufficient funds")) {
        setErrorMsg(
          "Unable to cancel booking: You need to have sufficient funds to cover the cancellation penalty. Please add more funds to your account or contact support."
        );
      } else {
        setErrorMsg(e.response?.data?.error || e.message);
      }
    } finally {
      hideLoading();
    }
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />
      {customerError && isStaff && (
        <ErrorToast message={customerError} onClose={() => {}} />
      )}
      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Booking {booking.bookingID}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "booked"
                  ? "bg-primary text-white dark:bg-primary-dark"
                  : booking.status === "checked-in"
                  ? "bg-primary text-white dark:bg-primary-dark"
                  : booking.status === "checked-out"
                  ? "bg-primary text-white dark:bg-primary-dark"
                  : "bg-error text-white"
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={mapPinIcon}
                    alt="Location"
                    className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                  />
                  <p className="text-gray-600 dark:text-gray-300">
                    {booking.hotelDetails.address}
                  </p>
                </div>
                {booking.hotelDetails.phone && (
                  <div className="flex items-center gap-2">
                    <img
                      src={phoneIcon}
                      alt="Phone"
                      className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    <a
                      href={`tel:${booking.hotelDetails.phone}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark"
                    >
                      {booking.hotelDetails.phone}
                    </a>
                  </div>
                )}
                {booking.hotelDetails.email && (
                  <div className="flex items-center gap-2">
                    <img
                      src={emailIcon}
                      alt="Email"
                      className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    <a
                      href={`mailto:${booking.hotelDetails.email}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark"
                    >
                      {booking.hotelDetails.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {isStaff && !customerLoading && customer && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src={profileIcon}
                    alt="Customer"
                    className="h-6 w-6 dark:invert dark:brightness-0 dark:opacity-80"
                  />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Customer Information
                  </h4>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary-dark/20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary dark:text-primary-dark">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customer ID: {customer.customerID}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {customer.email && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <img
                            src={emailIcon}
                            alt="Email"
                            className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email
                          </p>
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-dark"
                          >
                            {customer.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {customer.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <img
                            src={phoneIcon}
                            alt="Phone"
                            className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Phone
                          </p>
                          <a
                            href={`tel:${customer.phoneNumber}`}
                            className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-dark"
                          >
                            {customer.phoneNumber}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {customer.address && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <img
                          src={mapPinIcon}
                          alt="Address"
                          className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Address
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {customer.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            {(booking.status === "booked" ||
              booking.status === "checked-in") && (
              <button
                onClick={cancel}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error hover:bg-error-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
              >
                Cancel Booking
              </button>
            )}
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
      </div>
    </div>
  );
}
