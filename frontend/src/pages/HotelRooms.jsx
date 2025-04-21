import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function HotelRooms() {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // date state
  const today = new Date().toISOString().split("T")[0];
  const [ci, setCi] = useState(today);
  const [co, setCo] = useState(today);

  useEffect(() => {
    api
      .get(`/hotels/${hotelId}/rooms`)
      .then((r) => setRooms(r.data))
      .catch((e) => setErr(e.message));
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
      await api.post(`/hotels/${hotelId}/bookings`, {
        roomDetails: [num],
        checkInDate: ciD.toISOString(),
        checkOutDate: coD.toISOString(),
        totalAmount: 200,
      });
      setMsg("Booked!");
      const r = await api.get(`/hotels/${hotelId}/rooms`);
      setRooms(r.data);
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
            onChange={(e) => setCi(e.target.value)}
          />
        </label>
        <label>
          Check‑out
          <input
            type="date"
            value={co}
            onChange={(e) => setCo(e.target.value)}
          />
        </label>
      </div>

      {err && <p className="err">{err}</p>}
      {msg && <p className="ok">{msg}</p>}

      <ul className="card-list">
        {rooms.map((r) => (
          <li className="card" key={r.roomNumber}>
            <h3>Room {r.roomNumber}</h3>
            <p>Type: {r.type}</p>
            <p>Status: {r.status}</p>
            {r.status === "available" && (
              <button onClick={() => book(r.roomNumber)}>Book</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
