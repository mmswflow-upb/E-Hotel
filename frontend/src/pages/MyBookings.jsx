import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const bookings = (await api.get("/bookings/mine")).data;
        setRows(bookings);
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      }
    })();
  }, []);

  if (err) return <p className="err">{err}</p>;

  return (
    <div className="center">
      <h2>My bookings</h2>
      <div className="booking-list">
        {rows.map((b) => (
          <div key={b.bookingID} className="booking-card">
            <div className="booking-header">
              <h3>{b.hotelDetails.name}</h3>
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </div>
            <div className="booking-details">
              <div className="hotel-info">
                <p>{b.hotelDetails.address}</p>
                <p>{b.hotelDetails.starRating}★</p>
              </div>
              <div className="room-info">
                <h4>Rooms:</h4>
                <ul>
                  {b.roomDetails.map((room, index) => (
                    <li key={index}>
                      Room {room.roomNumber} ({room.type})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="dates-info">
                <p>
                  <strong>Check-in:</strong>{" "}
                  {new Date(b.checkInDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {new Date(b.checkOutDate).toLocaleDateString()}
                </p>
                {b.checkedOutAt && (
                  <p>
                    <strong>Checked out:</strong>{" "}
                    {new Date(b.checkedOutAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="payment-info">
                <p>
                  <strong>Total:</strong> ${b.totalAmount}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span className={`payment-status ${b.paymentStatus}`}>
                    {b.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
            <div className="booking-actions">
              <Link to={`/bookings/${b.bookingID}`}>View Details</Link>
              {b.hasInvoice && (
                <Link to={`/bookings/${b.bookingID}/invoice`}>
                  View Invoice
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
