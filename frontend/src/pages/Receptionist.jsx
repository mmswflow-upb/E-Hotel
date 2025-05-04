import { useEffect, useState } from "react";
import api from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";

export default function Reception() {
  const { showLoading, hideLoading } = useLoading();
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    showLoading();
    api
      .get("/hotels")
      .then((r) => setHotels(r.data))
      .catch((e) => setErrorMsg(e.message))
      .finally(() => hideLoading());
  }, []);

  async function createBooking() {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      showLoading();
      // assume helper endpoint
      const u = await api.get(`/users/by-email`, { params: { email } });
      const uid = u.data.uid;
      const rooms = await api.get(`/hotels/${hotel}/rooms`);
      const room = rooms.data.find((r) => r.status === "available");
      if (!room) throw new Error("No available rooms");
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 3600e3);
      await api.post(`/hotels/${hotel}/bookings`, {
        customerId: uid,
        roomID: room.roomNumber,
        checkInDate: today.toISOString(),
        checkOutDate: tomorrow.toISOString(),
        totalAmount: 200,
      });
      setSuccessMsg("Booking created successfully");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />
      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Reception
        </h2>
        <div className="space-y-4">
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
          >
            <option value="">-- choose hotel --</option>
            {hotels.map((h) => (
              <option key={h.hotelID} value={h.hotelID}>
                {h.name}
              </option>
            ))}
          </select>
          <input
            placeholder="customer email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
          />
          <button
            disabled={!hotel || !email}
            onClick={createBooking}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:opacity-50"
          >
            Make booking
          </button>
        </div>
      </div>
    </div>
  );
}
