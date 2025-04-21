import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Reception() {
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/hotels").then((r) => setHotels(r.data));
  }, []);

  async function createBooking() {
    setErr("");
    setMsg("");
    try {
      // assume helper endpoint
      const u = await api.get(`/users/by-email`, { params: { email } });
      const uid = u.data.uid;
      const rooms = await api.get(`/hotels/${hotel}/rooms`);
      const room = rooms.data.find((r) => r.status === "available");
      if (!room) throw new Error("No available rooms");
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 3600e3);
      await api.post(`/bookings`, {
        customerId: uid,
        hotelId: hotel,
        roomDetails: [room.roomNumber],
        checkInDate: today.toISOString(),
        checkOutDate: tomorrow.toISOString(),
        totalAmount: 200,
      });
      setMsg("Booking created");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="center">
      <h2>Reception</h2>
      <select value={hotel} onChange={(e) => setHotel(e.target.value)}>
        <option value="">-- choose hotel --</option>
        {hotels.map((h) => (
          <option key={h.hotelID} value={h.hotelID}>
            {h.name}
          </option>
        ))}
      </select>
      <input
        placeholder="customer email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={!hotel || !email} onClick={createBooking}>
        Make booking
      </button>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
