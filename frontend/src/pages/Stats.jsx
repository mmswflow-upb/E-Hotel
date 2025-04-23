import { useEffect, useState } from "react";
import api from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";

export default function Stats() {
  const { showLoading, hideLoading } = useLoading();
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState("");
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    showLoading();
    api
      .get("/hotels")
      .then((r) => setHotels(r.data))
      .catch((e) => setErr(e.message))
      .finally(() => hideLoading());
  }, []);

  async function load() {
    setErr("");
    setStats(null);
    try {
      showLoading();
      const dt = new Date();
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const r = await api.get(
        `/hotels/${hotel}/stats/monthly?year=${y}&month=${m}`
      );
      setStats(r.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="center">
      <h2>Monthly stats</h2>
      <select value={hotel} onChange={(e) => setHotel(e.target.value)}>
        <option value="">-- choose hotel --</option>
        {hotels.map((h) => (
          <option key={h.hotelID} value={h.hotelID}>
            {h.name}
          </option>
        ))}
      </select>
      {hotel && <button onClick={load}>Load</button>}
      {err && <p className="err">{err}</p>}
      {stats && (
        <ul className="card">
          <li>Total revenue: {stats.totalRevenue}</li>
          <li>Occupancy: {(stats.occupancyRate * 100).toFixed(1)}%</li>
          <li>Cancellation count: {stats.cancellationCount}</li>
        </ul>
      )}
    </div>
  );
}
