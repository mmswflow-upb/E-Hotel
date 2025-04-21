import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="center">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="password"
        />
        <button>Sign in</button>
      </form>
      {err && <p className="err">{err}</p>}
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
