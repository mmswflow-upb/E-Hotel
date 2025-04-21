import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLd] = useState(true);

  useEffect(
    () =>
      onIdTokenChanged(auth, async (u) => {
        console.log("Auth state changed:", u);
        if (!u) {
          console.log("No user found, setting state to null");
          setUser(null);
          setRole(null);
          setLd(false);
          return;
        }
        try {
          const tokenResult = await u.getIdTokenResult();
          console.log("Token result:", tokenResult);
          const claims = tokenResult.claims;
          console.log("Claims:", claims);
          setUser(u);
          setRole(claims.role || "Tourist");
          console.log("Set role to:", claims.role || "Tourist");
        } catch (error) {
          console.error("Error getting token result:", error);
        }
        setLd(false);
      }),
    []
  );

  return (
    <Ctx.Provider value={{ user, role, loading }}>{children}</Ctx.Provider>
  );
}
