// services/roomService.js
const { db } = require("../firebase");
const Room = require("../models/Room");

const roomsCol = db.collection("rooms");

exports.listRooms = async (hotelId) => {
  const snap = await roomsCol.where("hotelID", "==", hotelId).get();
  return snap.docs.map(
    (d) =>
      new Room({
        ...d.data(),
        roomNumber: d.data().roomNumber,
        type: d.data().type,
        status: d.data().status,
        hotelID: hotelId,
      })
  );
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
