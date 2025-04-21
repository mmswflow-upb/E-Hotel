import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
        if (res.data.hasInvoice) {
          try {
            const iv = await api.get(`/bookings/${bookingId}/invoice`);
            setInvoice(iv.data);
          } catch {}
        }
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
      setBooking({ ...booking, status: "canceled" });
      setMsg("Canceled.");
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err) return <p className="err">{err}</p>;
  if (!booking) return <p>Loading…</p>;

  return (
    <div className="center">
      <div className="booking-detail">
        <div className="booking-header">
          <h2>Booking {booking.bookingID}</h2>
          <span className={`status-badge ${booking.status}`}>
            {booking.status}
          </span>
        </div>

        <div className="booking-section">
          <h3>Hotel Information</h3>
          <div className="hotel-info">
            <p>
              <strong>Name:</strong> {booking.hotelDetails.name}
            </p>
            <p>
              <strong>Address:</strong> {booking.hotelDetails.address}
            </p>
            <p>
              <strong>Rating:</strong> {booking.hotelDetails.starRating}★
            </p>
          </div>
        </div>

        <div className="booking-section">
          <h3>Room Details</h3>
          <div className="room-list">
            {booking.roomDetails.map((room, index) => (
              <div key={index} className="room-card">
                <p>
                  <strong>Room Number:</strong> {room.roomNumber}
                </p>
                <p>
                  <strong>Type:</strong> {room.type}
                </p>
                <p>
                  <strong>Status:</strong> {room.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="booking-section">
          <h3>Dates</h3>
          <div className="dates-info">
            <p>
              <strong>Check-in:</strong>{" "}
              {new Date(booking.checkInDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Check-out:</strong>{" "}
              {new Date(booking.checkOutDate).toLocaleDateString()}
            </p>
            {booking.checkedOutAt && (
              <p>
                <strong>Checked out:</strong>{" "}
                {new Date(booking.checkedOutAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="booking-section">
          <h3>Payment Information</h3>
          <div className="payment-info">
            <p>
              <strong>Total Amount:</strong> ${booking.totalAmount}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span className={`payment-status ${booking.paymentStatus}`}>
                {booking.paymentStatus}
              </span>
            </p>
            {invoice && (
              <p>
                <Link to={`/bookings/${bookingId}/invoice`}>View Invoice</Link>
              </p>
            )}
          </div>
        </div>

        <div className="booking-actions">
          {booking.status === "booked" && (
            <button onClick={cancel} className="cancel-button">
              Cancel Booking
            </button>
          )}
          {msg && <p className="ok">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
