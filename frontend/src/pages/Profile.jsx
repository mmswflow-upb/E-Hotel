import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Profile() {
  const [d, setD] = useState({ name: "", contactInfo: "", identification: "" });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    api
      .get("/customers/me")
      .then((r) => setD(r.data))
      .catch((e) => setErr(e.message));
  }, []);
  function h(e) {
    setD({ ...d, [e.target.name]: e.target.value });
  }
  async function save() {
    setErr("");
    setMsg("");
    try {
      await api.put("/customers/me", d);
      setMsg("Saved");
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="center">
      <h2>Profile</h2>
      {["name", "contactInfo", "identification"].map((k) => (
        <input key={k} name={k} value={d[k] || ""} onChange={h} />
      ))}
      <button onClick={save}>Save</button>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
