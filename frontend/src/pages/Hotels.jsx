import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/hotels")
      .then((r) => {
        setHotels(r.data);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.response?.data?.error || e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="center">Loading hotels...</p>;
  if (err) return <p className="err">{err}</p>;

  return (
    <div className="center">
      <h2>Hotels</h2>
      {hotels.length === 0 ? (
        <p>No hotels found</p>
      ) : (
        <ul className="card-list">
          {hotels.map((h) => (
            <li key={h.hotelID} className="card">
              <h3>{h.name}</h3>
              <p>
                {h.starRating}★ — {h.address}
              </p>
              <Link to={`/hotels/${h.hotelID}`}>View Rooms</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
