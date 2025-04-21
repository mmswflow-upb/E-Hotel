import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import api from "../lib/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      await api.put("/customers/me", { name: email.split("@")[0] });
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="center">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button>Create account</button>
      </form>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
