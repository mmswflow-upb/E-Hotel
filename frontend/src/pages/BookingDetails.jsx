import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const [b, setB] = useState(null);
  const [inv, setInv] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setB(res.data);
        try {
          const iv = await api.get(`/bookings/${bookingId}/invoice`);
          setInv(iv.data);
        } catch {}
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [bookingId]);

  async function cancel() {
    setErr("");
    setMsg("");
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setB({ ...b, status: "canceled" });
      setMsg("Canceled.");
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err) return <p className="err">{err}</p>;
  if (!b) return <p>Loading…</p>;

  return (
    <div className="center">
      <h2>Booking {b.bookingID}</h2>
      <p>Status: {b.status}</p>
      <p>Rooms: {b.roomDetails.join(", ")}</p>
      {b.status === "booked" && <button onClick={cancel}>Cancel</button>}
      {msg && <p className="ok">{msg}</p>}
      {inv && (
        <p>
          <Link to={`/bookings/${bookingId}/invoice`}>View invoice</Link>
        </p>
      )}
    </div>
  );
}
