import { useEffect, useState } from "react";
import api from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { useAuth } from "../contexts/AuthContext";
import scheduledIcon from "../assets/scheduled.png";
import BookingCard from "../components/BookingCard";
import ErrorToast from "../components/ErrorToast";

export default function MyBookings() {
  const [bookings, setBookings] = useState({
    history: [],
    active: [],
    future: [],
  });
  const [err, setErr] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const { user, role } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        showLoading();

        // Different fetching strategy based on user role
        if (role === "Receptionist" || role === "HotelManager") {
          // For staff, fetch hotel bookings
          const receptionistResponse = await api.get("/accounts/me");
          const hotelId = receptionistResponse.data.hotelID;

          if (!hotelId) {
            throw new Error("No hotel assigned to this staff member");
          }

          // Get bookings for the hotel
          const bookingsResponse = await api.get(`/hotels/${hotelId}/bookings`);
          const hotelBookings = bookingsResponse.data;

          // Categorize bookings
          const history = hotelBookings.filter(
            (b) => b.status === "checked-out" || b.status === "cancelled"
          );
          const active = hotelBookings.filter((b) => b.status === "checked-in");
          const future = hotelBookings.filter((b) => b.status === "booked");

          setBookings({ history, active, future });
        } else {
          // For customers, get bookings from all hotels
          const hotelsResponse = await api.get("/hotels");
          const hotels = hotelsResponse.data;

          // Fetch bookings from each hotel
          const allBookings = await Promise.all(
            hotels.map(async (hotel) => {
              try {
                const response = await api.get(
                  `/hotels/${hotel.hotelID}/bookings`
                );
                return response.data;
              } catch (error) {
                console.error(
                  `Error fetching bookings for hotel ${hotel.hotelID}:`,
                  error
                );
                return { history: [], active: [], future: [] };
              }
            })
          );

          // Combine bookings from all hotels and remove duplicates
          const combinedBookings = allBookings.reduce(
            (acc, hotelBookings) => {
              // Helper function to add unique bookings
              const addUniqueBookings = (source, target) => {
                const existingIds = new Set(target.map((b) => b.bookingID));
                return [
                  ...target,
                  ...source.filter((b) => !existingIds.has(b.bookingID)),
                ];
              };

              return {
                history: addUniqueBookings(hotelBookings.history, acc.history),
                active: addUniqueBookings(hotelBookings.active, acc.active),
                future: addUniqueBookings(hotelBookings.future, acc.future),
              };
            },
            { history: [], active: [], future: [] }
          );

          setBookings(combinedBookings);
        }
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      } finally {
        hideLoading();
      }
    };

    fetchBookings();
  }, [role]);

  const pageTitle =
    role === "Receptionist" || role === "HotelManager"
      ? "Hotel Bookings"
      : "My Bookings";

  if (err)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <ErrorToast message={err} onClose={() => setErr("")} />
        <p className="text-red-500 text-center mt-8">{err}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <img
              src={scheduledIcon}
              alt={pageTitle}
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {pageTitle}
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
              Past Bookings
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
