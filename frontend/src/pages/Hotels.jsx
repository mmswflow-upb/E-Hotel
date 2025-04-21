import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api
      .get("/hotels")
      .then((r) => setHotels(r.data))
      .catch((e) => setErr(e.message));
  }, []);
  if (err) return <p className="err">{err}</p>;
  return (
    <div className="center">
      <h2>Hotels</h2>
      <ul className="card-list">
        {hotels.map((h) => (
          <li key={h.hotelID} className="card">
            <h3>{h.name}</h3>
            <p>
              {h.starRating}★ — {h.address}
            </p>
            <Link to={`/hotels/${h.hotelID}`}>Rooms</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
