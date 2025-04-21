import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const hotels = (await api.get("/hotels")).data;
        const all = [];
        for (const h of hotels) {
          const r = await api.get(`/hotels/${h.hotelID}/bookings/mine`);
          r.data.forEach((b) => all.push({ ...b, hotel: h.name }));
        }
        setRows(all);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);
  if (err) return <p className="err">{err}</p>;
  return (
    <div className="center">
      <h2>My bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Hotel</th>
            <th>Rooms</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.bookingID}>
              <td>
                <Link to={`/bookings/${b.bookingID}`}>{b.hotel}</Link>
              </td>
              <td>{b.roomDetails.join(",")}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
