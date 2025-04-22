// services/roomService.js
const { db } = require("../firebase");
const Room = require("../models/room");
const bookingService = require("./bookingService");

const roomsCol = db.collection("rooms");

exports.listRooms = async (hotelId, { checkInDate, checkOutDate } = {}) => {
  const snap = await roomsCol.where("hotelID", "==", hotelId).get();
  const rooms = snap.docs.map(
    (d) =>
      new Room({
        ...d.data(),
        roomNumber: d.data().roomNumber,
        type: d.data().type,
        status: d.data().status,
        hotelID: hotelId,
      })
  );

  // If dates are provided, check availability
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Get all bookings for this hotel
    const bookings = await bookingService.listBookings({ hotelId });

    // Filter out rooms that are booked during the requested period
    const availableRooms = rooms.filter((room) => {
      const isBooked = bookings.some((booking) => {
        const bookingCheckIn = new Date(booking.checkInDate);
        const bookingCheckOut = new Date(booking.checkOutDate);

        // Check if the room is in this booking
        const isRoomInBooking = booking.roomDetails.some(
          (roomDetail) => roomDetail.roomNumber === room.roomNumber
        );

        // Check if the booking overlaps with the requested period
        const isOverlapping =
          (checkIn >= bookingCheckIn && checkIn < bookingCheckOut) ||
          (checkOut > bookingCheckIn && checkOut <= bookingCheckOut) ||
          (checkIn <= bookingCheckIn && checkOut >= bookingCheckOut);

        return (
          isRoomInBooking && isOverlapping && booking.status !== "canceled"
        );
      });

      return !isBooked;
    });

    return availableRooms;
  }

  return rooms;
};

exports.createRoom = async ({ hotelId, roomNumber, type }) => {
  const ref = await roomsCol.add({
    hotelID: hotelId,
    roomNumber,
    type,
    status: "available",
  });
  const d = await ref.get();
  return new Room({
    ...d.data(),
    roomNumber: d.data().roomNumber,
    type: d.data().type,
    status: d.data().status,
    hotelID,
  });
};

exports.updateRoomStatus = async (roomId, status) => {
  await roomsCol.doc(roomId).update({ status });
};

exports.checkAvailability = async (hotelId, roomIds) => {
  const snaps = await Promise.all(roomIds.map((id) => roomsCol.doc(id).get()));
  return snaps.every(
    (s) =>
      s.exists &&
      s.data().hotelID === hotelId &&
      s.data().status === "available"
  );
};
