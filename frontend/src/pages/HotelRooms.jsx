import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import RoomCard from "../components/RoomCard";
import HotelHeader from "../components/HotelHeader";
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";

// Import local icons
import mapPinIcon from "../assets/map-pin.png";
import wifiIcon from "../assets/wifi.png";
import restaurantIcon from "../assets/restaurant.png";
import poolIcon from "../assets/pool.png";
import hotelIcon from "../assets/hotel.png";
import phoneIcon from "../assets/phone-call.png";
import emailIcon from "../assets/email.png";

export default function HotelRooms() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [userAccount, setUserAccount] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // date state
  const today = new Date().toISOString().split("T")[0];
  const [ci, setCi] = useState(today);
  const [co, setCo] = useState(today);

  // Fetch user account data
  useEffect(() => {
    if (!user) return;

    const fetchUserAccount = async () => {
      try {
        showLoading();
        const response = await api.get("/accounts/me");
        setUserAccount(response.data);
      } catch (error) {
        console.error("Error fetching user account:", error);
      } finally {
        hideLoading();
      }
    };

    fetchUserAccount();
  }, [user]);

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      setErr("Please log in to view hotel rooms");
      return;
    }
  }, [user]);

  // Fetch hotel details (which now includes services)
  useEffect(() => {
    if (!user) return; // Don't fetch if not authenticated

    const fetchHotelDetails = async () => {
      try {
        showLoading();
        const response = await api.get(`/hotels/${hotelId}`);
        setHotel(response.data);
      } catch (error) {
        console.error("Error fetching hotel details:", error);
        if (error.response?.status === 401) {
          setErr("Please log in to view hotel details");
        } else if (error.response?.status === 404) {
          setErr(
            "Hotel not found. The hotel you're looking for doesn't exist or has been removed."
          );
          // Redirect to hotels list after 3 seconds
          setTimeout(() => {
            navigate("/hotels");
          }, 3000);
        } else {
          setErr(error.response?.data?.error || "Error fetching hotel details");
        }
      } finally {
        hideLoading();
      }
    };
    fetchHotelDetails();
  }, [hotelId, user, navigate]);

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
    if (!user) return; // Don't fetch if not authenticated

    try {
      showLoading();
      const response = await api.get(`/hotels/${hotelId}/rooms`, {
        params: { checkIn: ci, checkOut: co },
      });
      setRooms(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setErr("Please log in to view available rooms");
      } else {
        setErr(error.response?.data?.error || error.message);
      }
    } finally {
      hideLoading();
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [hotelId, user]);

  async function book(num) {
    try {
      showLoading();
      const response = await api.post(`/hotels/${hotelId}/bookings`, {
        roomID: num,
        checkInDate: ci,
        checkOutDate: co,
        totalAmount: 200, // Assuming a fixed amount for now, you might want to get this from the room data
      });
      setMsg("Room booked successfully!");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data?.error || error.message);
    } finally {
      hideLoading();
    }
  }

  async function updateRoomStatus(roomNumber, newStatus) {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      showLoading();
      await api.patch(`/hotels/${hotelId}/rooms/${roomNumber}`, {
        status: newStatus,
      });
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === roomNumber ? { ...r, status: newStatus } : r
        )
      );
      setSuccessMsg("Room status updated successfully");
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
      <div className="max-w-7xl mx-auto">
        {err && <p className="text-red-500 text-center mb-6">{err}</p>}
        {msg && <p className="text-green-500 text-center mb-6">{msg}</p>}

        <HotelHeader hotel={hotel} />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={ci}
                onChange={(e) => updateDates(e.target.value, co)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={co}
                onChange={(e) => updateDates(ci, e.target.value)}
                min={ci}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchRooms}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
              >
                Search Rooms
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.roomNumber}
              room={room}
              userAccount={userAccount}
              ci={ci}
              co={co}
              onBook={book}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
