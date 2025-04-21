import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function HotelRooms() {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // date state
  const today = new Date().toISOString().split("T")[0];
  const [ci, setCi] = useState(today);
  const [co, setCo] = useState(today);

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
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

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

  return (
    <div className="center">
      <h2>Rooms</h2>

      <div className="dates">
        <label>
          Check‑in{" "}
          <input
            type="date"
            value={ci}
            onChange={(e) => updateDates(e.target.value, co)}
            min={today}
          />
        </label>
        <label>
          Check‑out
          <input
            type="date"
            value={co}
            onChange={(e) => updateDates(ci, e.target.value)}
            min={ci}
          />
        </label>
        <button
          onClick={fetchRooms}
          disabled={loading}
          className="refresh-button"
        >
          {loading ? "Loading..." : "Update Availability"}
        </button>
      </div>

      {err && <p className="err">{err}</p>}
      {msg && <p className="ok">{msg}</p>}

      <ul className="card-list">
        {rooms.map((r) => (
          <li className="card" key={r.roomNumber}>
            <h3>Room {r.roomNumber}</h3>
            <p>Type: {r.type}</p>
            <p>Status: {r.status}</p>
            <p>Price per night: ${r.pricePerNight}</p>
            {r.status === "available" && (
              <button onClick={() => book(r.roomNumber)}>Book</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
