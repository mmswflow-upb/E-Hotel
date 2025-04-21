import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import roomIcon from "../assets/room.png";

export default function HotelRooms() {
  const { hotelId } = useParams();
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
              Rooms
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-in
              </label>
              <input
                type="date"
                value={ci}
                onChange={(e) => updateDates(e.target.value, co)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-out
              </label>
              <input
                type="date"
                value={co}
                onChange={(e) => updateDates(ci, e.target.value)}
                min={ci}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Update Availability"}
              </button>
            </div>
          </div>
        </div>

        {err && <p className="text-red-500 text-center mb-4">{err}</p>}
        {msg && <p className="text-green-500 text-center mb-4">{msg}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div
              key={r.roomNumber}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Room {r.roomNumber}
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Type: {r.type}</p>
                <p>Status: {r.status}</p>
                <p>Price per night: ${r.pricePerNight}</p>
              </div>
              {r.status === "available" && (
                <button
                  onClick={() => book(r.roomNumber)}
                  className="mt-4 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Book
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
