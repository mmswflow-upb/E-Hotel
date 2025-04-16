// frontend/src/pages/ManagerDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../components/AuthProvider";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:5000/api/stats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setStats(data);
  };

  return (
    <div>
      <h2>Hotel Manager Dashboard</h2>
      <button onClick={fetchStats}>Generate Monthly Statistics</button>
      {stats && (
        <div>
          <p>Total Reservations: {stats.totalReservations}</p>
          <p>Booked: {stats.booked}</p>
          <p>Completed: {stats.completed}</p>
          <p>Cancelled: {stats.cancelled}</p>
          <p>Occupancy Rate: {stats.occupancyRate.toFixed(2)}%</p>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ManagerDashboard;
