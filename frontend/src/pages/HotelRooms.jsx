import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import roomIcon from "../assets/room.png";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";
import calendarIcon from "../assets/calendar.png";
// Import local icons
import mapPinIcon from "../assets/map-pin.png";
import wifiIcon from "../assets/wifi.png";
import restaurantIcon from "../assets/restaurant.png";
import poolIcon from "../assets/pool.png";
import spaIcon from "../assets/spa.png";
import parkingIcon from "../assets/parking.png";
import gymIcon from "../assets/gym.png";
import laundryIcon from "../assets/laundry.png";
import hotelIcon from "../assets/hotel.png";
import phoneIcon from "../assets/phone-call.png";
import emailIcon from "../assets/email.png";

export default function HotelRooms() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [userAccount, setUserAccount] = useState(null);

  // date state
  const today = new Date().toISOString().split("T")[0];
  const [ci, setCi] = useState(today);
  const [co, setCo] = useState(today);

  // Fetch user account data
  useEffect(() => {
    if (!user) return;

    const fetchUserAccount = async () => {
      try {
        const response = await api.get("/accounts/me");
        setUserAccount(response.data);
      } catch (error) {
        console.error("Error fetching user account:", error);
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
      if (e.response?.status === 401) {
        setErr("Please log in to view available rooms");
      } else {
        setErr(e.response?.data?.error || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [hotelId, user]);

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
    const canAfford = userAccount?.balance >= totalPrice;
    const balanceDifference = userAccount?.balance - totalPrice;

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
            <div
              className={`mt-2 p-2 rounded-md ${
                canAfford
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-yellow-50 dark:bg-yellow-900/20"
              }`}
            >
              <p
                className={`text-sm ${
                  canAfford
                    ? "text-green-700 dark:text-green-300"
                    : "text-yellow-700 dark:text-yellow-300"
                }`}
              >
                <span className="font-medium">Your balance:</span> $
                {userAccount?.balance || 0}
                {!canAfford && (
                  <span className="block mt-1">
                    You need ${Math.abs(balanceDifference).toFixed(2)} more to
                    book this room
                  </span>
                )}
                {canAfford && (
                  <span className="block mt-1">
                    You'll have ${balanceDifference.toFixed(2)} remaining after
                    booking
                  </span>
                )}
              </p>
            </div>
          </div>

          {room.status === "available" && (
            <button
              onClick={() => book(room.roomNumber)}
              className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:opacity-50 transition-colors duration-200`}
            >
              {canAfford ? "Book Now" : "Book with Insufficient Balance"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const HotelHeader = () => {
    if (!hotel) return null;

    const getServiceIcon = (serviceName) => {
      const iconMap = {
        WiFi: wifiIcon,
        Breakfast: restaurantIcon,
        "Pool Access": poolIcon,
        Spa: hotelIcon,
        Parking: hotelIcon,
        "Room Service": restaurantIcon,
        "Gym Access": hotelIcon,
        Laundry: hotelIcon,
      };
      return iconMap[serviceName] || hotelIcon;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 mb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {hotel.name}
            </h1>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`text-xl ${
                    index < hotel.starRating
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                ({hotel.starRating})
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <img
                src={mapPinIcon}
                alt="Location"
                className="w-5 h-5 dark:invert dark:brightness-0 dark:opacity-80"
              />
              <p>{hotel.address}</p>
            </div>

            {hotel.phone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <img
                  src={phoneIcon}
                  alt="Phone"
                  className="w-5 h-5 dark:invert dark:brightness-0 dark:opacity-80"
                />
                <p>{hotel.phone}</p>
              </div>
            )}

            {hotel.email && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <img
                  src={emailIcon}
                  alt="Email"
                  className="w-5 h-5 dark:invert dark:brightness-0 dark:opacity-80"
                />
                <p>{hotel.email}</p>
              </div>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            {hotel.description}
          </p>

          {/* Services Section */}
          {hotel.availableServices && hotel.availableServices.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Available Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hotel.availableServices.map((service) => (
                  <div
                    key={service.serviceID}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <img
                      src={getServiceIcon(service.name)}
                      alt={service.name}
                      className="w-6 h-6 mt-1 dark:invert dark:brightness-0 dark:opacity-80"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {service.description}
                      </p>
                      <p className="text-sm font-medium text-primary dark:text-primary-dark">
                        ${service.cost}{" "}
                        {service.isOneTime ? "one-time" : "per use"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <HotelHeader />
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
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:opacity-50 transition-colors duration-200"
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
