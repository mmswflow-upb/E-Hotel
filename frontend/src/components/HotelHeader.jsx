import mapPinIcon from "../assets/map-pin.png";
import wifiIcon from "../assets/wifi.png";
import restaurantIcon from "../assets/restaurant.png";
import poolIcon from "../assets/pool.png";
import hotelIcon from "../assets/hotel.png";
import phoneIcon from "../assets/phone-call.png";
import emailIcon from "../assets/email.png";

export default function HotelHeader({ hotel }) {
  if (!hotel) return null;

  const getServiceIcon = (serviceName) => {
    switch (serviceName.toLowerCase()) {
      case "wifi":
        return wifiIcon;
      case "restaurant":
      case "room service":
        return restaurantIcon;
      case "pool":
        return poolIcon;
      default:
        return hotelIcon;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6 mb-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {hotel.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={mapPinIcon}
                  alt="Location"
                  className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                />
                <p className="text-gray-600 dark:text-gray-300">
                  {hotel.address}
                </p>
              </div>
              {hotel.phone && (
                <div className="flex items-center gap-2">
                  <img
                    src={phoneIcon}
                    alt="Phone"
                    className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                  />
                  <a
                    href={`tel:${hotel.phone}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark"
                  >
                    {hotel.phone}
                  </a>
                </div>
              )}
              {hotel.email && (
                <div className="flex items-center gap-2">
                  <img
                    src={emailIcon}
                    alt="Email"
                    className="h-5 w-5 dark:invert dark:brightness-0 dark:opacity-80"
                  />
                  <a
                    href={`mailto:${hotel.email}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark"
                  >
                    {hotel.email}
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`text-2xl ${
                  index < hotel.starRating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {hotel.description && (
          <p className="text-gray-600 dark:text-gray-300">
            {hotel.description}
          </p>
        )}

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
}
