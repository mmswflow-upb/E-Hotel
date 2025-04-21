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
        if (!u) {
          setUser(null);
          setRole(null);
          setLd(false);
          return;
        }
        const claims = (await u.getIdTokenResult()).claims;
        setUser(u);
        setRole(claims.role || "Tourist");
        setLd(false);
      }),
    []
  );

  return (
    <Ctx.Provider value={{ user, role, loading }}>{children}</Ctx.Provider>
  );
}
