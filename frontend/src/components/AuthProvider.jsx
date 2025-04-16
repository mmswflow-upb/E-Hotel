// frontend/src/components/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        setRole(tokenResult.claims.role || "tourist");
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
