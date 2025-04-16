// frontend/src/pages/TouristDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";

const TouristDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [roomType, setRoomType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [message, setMessage] = useState("");

  const fetchReservations = async () => {
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:5000/api/reservations", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setReservations(data);
  };

  const createReservation = async () => {
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:5000/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomType, checkInDate, checkOutDate }),
    });
    const data = await response.json();
    setMessage("Reservation created: " + JSON.stringify(data));
    fetchReservations();
  };

  const cancelReservation = async (id) => {
    const token = await user.getIdToken();
    const response = await fetch(
      `http://localhost:5000/api/reservations/${id}/cancel`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    setMessage("Reservation cancelled: " + JSON.stringify(data));
    fetchReservations();
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Tourist Dashboard</h2>
      <div>
        <h3>Create Reservation</h3>
        <input
          placeholder="Room Type"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        />
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
        />
        <button onClick={createReservation}>Create Reservation</button>
      </div>
      <h3>Your Reservations</h3>
      <ul>
        {reservations.map((res) => (
          <li key={res.id}>
            {res.roomType} – {res.status} –{" "}
            {new Date(res.checkInDate.seconds * 1000).toLocaleDateString()} to{" "}
            {new Date(res.checkOutDate.seconds * 1000).toLocaleDateString()}
            {res.status === "booked" && (
              <button onClick={() => cancelReservation(res.id)}>Cancel</button>
            )}
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TouristDashboard;
