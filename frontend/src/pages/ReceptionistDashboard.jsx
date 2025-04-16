// frontend/src/pages/ReceptionistDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
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

  const checkIn = async (id) => {
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:5000/api/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reservationId: id }),
    });
    const data = await response.json();
    setMessage("Checked in: " + JSON.stringify(data));
    fetchReservations();
  };

  const checkOut = async (id) => {
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:5000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reservationId: id }),
    });
    const data = await response.json();
    setMessage("Checked out: " + JSON.stringify(data));
    fetchReservations();
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Receptionist Dashboard</h2>
      <h3>All Reservations</h3>
      <ul>
        {reservations.map((res) => (
          <li key={res.id}>
            {res.roomType} – {res.status} –{" "}
            {res.checkInDate
              ? new Date(res.checkInDate.seconds * 1000).toLocaleDateString()
              : "N/A"}{" "}
            to{" "}
            {res.checkOutDate
              ? new Date(res.checkOutDate.seconds * 1000).toLocaleDateString()
              : "N/A"}
            {res.status === "booked" && (
              <button onClick={() => checkIn(res.id)}>Check-In</button>
            )}
            {res.status === "occupied" && (
              <button onClick={() => checkOut(res.id)}>Check-Out</button>
            )}
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ReceptionistDashboard;
