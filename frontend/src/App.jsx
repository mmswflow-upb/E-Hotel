// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import TouristDashboard from "./pages/TouristDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tourist" element={<TouristDashboard />} />
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
