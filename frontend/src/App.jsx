/* frontend/src/App.jsx */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import NavBar from "./components/NavBar";
import Protected from "./components/Protected";

// pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hotels from "./pages/Hotels";
import HotelRooms from "./pages/HotelRooms";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import BookingDet from "./pages/BookingDetails";
import Invoice from "./pages/Invoice";
import Reception from "./pages/Receptionist";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          {/* public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:hotelId" element={<HotelRooms />} />

          {/* protected */}
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <Protected>
                <MyBookings />
              </Protected>
            }
          />
          <Route
            path="/bookings/:bookingId"
            element={
              <Protected>
                <BookingDet />
              </Protected>
            }
          />
          <Route
            path="/bookings/:bookingId/invoice"
            element={
              <Protected>
                <Invoice />
              </Protected>
            }
          />

          <Route
            path="/reception"
            element={
              <Protected roles={["Receptionist", "SystemAdmin"]}>
                <Reception />
              </Protected>
            }
          />

          {/* manager / admin */}
          <Route
            path="/stats"
            element={
              <Protected roles={["HotelManager", "SystemAdmin"]}>
                <Stats />
              </Protected>
            }
          />

          {/* fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
