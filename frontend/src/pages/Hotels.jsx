import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";
import hotelIcon from "../assets/hotel.png";
import roomIcon from "../assets/room.png";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/hotels")
      .then((r) => {
        setHotels(r.data);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.response?.data?.error || e.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">
        Loading hotels...
      </p>
    );
  if (err) return <p className="text-red-500 text-center">{err}</p>;

  const HotelCard = ({ hotel }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {hotel.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Rating:</span>{" "}
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
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Address:</span> {hotel.address}
          </p>
          {hotel.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {hotel.description}
            </p>
          )}
        </div>

        <Link
          to={`/hotels/${hotel.hotelID}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img
            src={roomIcon}
            alt="View Rooms"
            className="h-5 w-5 invert brightness-0 opacity-80"
          />
          View Rooms
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <img
              src={hotelIcon}
              alt="Hotels"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Hotels
            </h2>
          </div>
        </div>

        {hotels.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No hotels found
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.hotelID} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
