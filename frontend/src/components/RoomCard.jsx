import { useState } from "react";
import bedRoomIcon from "../assets/bed-room.png";
import doubleBedRoomIcon from "../assets/double-bed-room.png";

export default function RoomCard({ room, userAccount, ci, co, onBook }) {
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
            onClick={() => onBook(room.roomNumber)}
            className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:opacity-50 transition-colors duration-200`}
          >
            {canAfford ? "Book Now" : "Book with Insufficient Balance"}
          </button>
        )}
      </div>
    </div>
  );
}
