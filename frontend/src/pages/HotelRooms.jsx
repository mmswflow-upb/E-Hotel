import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import roomIcon from "../assets/room.png";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";
import calendarIcon from "../assets/calendar.png";

export default function HotelRooms() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // date state
  const today = new Date().toISOString().split("T")[0];
  const [ci, setCi] = useState(today);
  const [co, setCo] = useState(today);

  // Function to update dates and ensure check-out is after check-in
  const updateDates = (newCi, newCo) => {
    const ciDate = new Date(newCi);
    const coDate = new Date(newCo);

    // If check-out is before or same as check-in, set it to one day after check-in
    if (coDate <= ciDate) {
      const nextDay = new Date(ciDate);
      nextDay.setDate(nextDay.getDate() + 1);
      newCo = nextDay.toISOString().split("T")[0];
    }

    setCi(newCi);
    setCo(newCo);
  };

  // Function to fetch rooms with date parameters
  const fetchRooms = async () => {
    setLoading(true);
    setErr("");
    try {
      const response = await api.get(`/hotels/${hotelId}/rooms`, {
        params: {
          checkInDate: ci,
          checkOutDate: co,
        },
      });
      setRooms(response.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  async function book(num) {
    setErr("");
    setMsg("");
    try {
      const ciD = new Date(ci),
        coD = new Date(co);
      if (coD <= ciD) {
        setErr("Check‑out must be after check‑in");
        return;
      }
      const room = rooms.find((r) => r.roomNumber === num);
      if (!room) {
        setErr("Room not found");
        return;
      }
      const nights = Math.ceil((coD - ciD) / (1000 * 60 * 60 * 24));
      const totalAmount = room.pricePerNight * nights;

      // Check if user can afford the room
      if (user?.balance < totalAmount) {
        const proceed = window.confirm(
          `Warning: Your current balance ($${user?.balance}) is insufficient for this booking ($${totalAmount}).\n\nDo you want to proceed anyway? You'll need to add funds before the check-in date.`
        );
        if (!proceed) return;
      }

      await api.post(`/hotels/${hotelId}/bookings`, {
        roomDetails: [num],
        checkInDate: ciD.toISOString(),
        checkOutDate: coD.toISOString(),
        totalAmount,
      });
      setMsg("Booked!");
      fetchRooms(); // Refresh room list after booking
    } catch (e) {
      setErr(e.message);
    }
  }

  const RoomCard = ({ room }) => {
    const ciDate = new Date(ci);
    const coDate = new Date(co);
    const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;
    const canAfford = user?.balance >= totalPrice;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Room {room.roomNumber}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                room.status === "available"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {room.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <img
                src={
                  room.type.toLowerCase().includes("double")
                    ? doubleBedRoomIcon
                    : bedRoomIcon
                }
                alt={room.type}
                className="h-6 w-6 dark:invert dark:brightness-0 dark:opacity-80"
              />
              <span className="font-medium">Type:</span> {room.type}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Price per night:</span> $
              {room.pricePerNight}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Total for {nights} nights:</span> $
              {totalPrice}
            </p>
            {!canAfford && (
              <p className="text-yellow-500 dark:text-yellow-400 text-sm">
                Warning: Your current balance (${user?.balance || 0}) is
                insufficient. You'll need to add funds before check-in.
              </p>
            )}
          </div>

          {room.status === "available" && (
            <button
              onClick={() => book(room.roomNumber)}
              className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                canAfford
                  ? "bg-green-600 hover:bg-green-500 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-500"
                  : "bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-500"
              }`}
            >
              {canAfford ? "Book Now" : "Book with Insufficient Balance"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <img
              src={roomIcon}
              alt="Rooms"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Available Rooms
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-in
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={ci}
                  onChange={(e) => updateDates(e.target.value, co)}
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-out
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={co}
                  onChange={(e) => updateDates(ci, e.target.value)}
                  min={ci}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                {loading ? "Loading..." : "Update Availability"}
              </button>
            </div>
          </div>
        </div>

        {err && <p className="text-red-500 text-center mb-4">{err}</p>}
        {msg && <p className="text-green-500 text-center mb-4">{msg}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.roomNumber} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
}
