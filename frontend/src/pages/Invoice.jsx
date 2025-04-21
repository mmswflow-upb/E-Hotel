import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function Invoice() {
  const { bookingId } = useParams();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get(`/bookings/${bookingId}/invoice`)
      .then((r) => setInv(r.data))
      .catch((e) => setErr(e.message));
  }, [bookingId]);

  if (err) return <p className="err">{err}</p>;
  if (!inv) return <p>Loading…</p>;

  return (
    <div className="center">
      <h2>Invoice {inv.invoiceID}</h2>
      <ul>
        {inv.itemizedCharges.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <p>Total: {inv.totalAmount}</p>
      <p>
        Date : {new Date(inv.issueDate._seconds * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}
