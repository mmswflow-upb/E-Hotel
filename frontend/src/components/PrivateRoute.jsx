// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// For react-router-dom v6, use Navigate instead of Redirect
const PrivateRoute = ({ element: Element, ...rest }) => {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      element={user ? <Element /> : <Navigate to="/login" replace />}
    />
  );
};

export default PrivateRoute;
