import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState({
    history: [],
    active: [],
    future: [],
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data);
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      }
    })();
  }, []);

  if (err) return <p className="err">{err}</p>;

  const BookingCard = ({ booking }) => (
    <div className="booking-card">
      <div className="booking-header">
        <h3>{booking.hotelDetails.name}</h3>
        <span className={`status-badge ${booking.status}`}>
          {booking.status}
        </span>
      </div>
      <div className="booking-details">
        <div className="hotel-info">
          <p>{booking.hotelDetails.address}</p>
          <p>{booking.hotelDetails.starRating}★</p>
        </div>
        <div className="room-info">
          <h4>Rooms:</h4>
          <ul>
            {booking.roomDetails.map((room, index) => (
              <li key={index}>
                Room {room.roomNumber} ({room.type})
              </li>
            ))}
          </ul>
        </div>
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
        <div className="payment-info">
          <p>
            <strong>Total:</strong> ${booking.totalAmount}
          </p>
          <p>
            <strong>Payment Status:</strong>{" "}
            <span className={`payment-status ${booking.paymentStatus}`}>
              {booking.paymentStatus}
            </span>
          </p>
        </div>
      </div>
      <div className="booking-actions">
        <Link to={`/bookings/${booking.bookingID}`}>View Details</Link>
        {booking.hasInvoice && (
          <Link to={`/bookings/${booking.bookingID}/invoice`}>
            View Invoice
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="center">
      <h2>My Bookings</h2>

      <div className="booking-section">
        <h3>Active Bookings</h3>
        <div className="booking-list">
          {bookings.active.length > 0 ? (
            bookings.active.map((booking) => (
              <BookingCard key={booking.bookingID} booking={booking} />
            ))
          ) : (
            <p>No active bookings</p>
          )}
        </div>
      </div>

      <div className="booking-section">
        <h3>Upcoming Bookings</h3>
        <div className="booking-list">
          {bookings.future.length > 0 ? (
            bookings.future.map((booking) => (
              <BookingCard key={booking.bookingID} booking={booking} />
            ))
          ) : (
            <p>No upcoming bookings</p>
          )}
        </div>
      </div>

      <div className="booking-section">
        <h3>Booking History</h3>
        <div className="booking-list">
          {bookings.history.length > 0 ? (
            bookings.history.map((booking) => (
              <BookingCard key={booking.bookingID} booking={booking} />
            ))
          ) : (
            <p>No past bookings</p>
          )}
        </div>
      </div>
    </div>
  );
}
