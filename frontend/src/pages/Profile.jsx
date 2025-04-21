import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { role } = useAuth();
  const [userData, setUserData] = useState({});
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/accounts/me");
        setUserData(response.data);
      } catch (e) {
        setErr(e.message);
      }
    };

    fetchUserData();
  }, [role]);

  function handleChange(e) {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }

  async function save() {
    setErr("");
    setMsg("");
    try {
      await api.put("/accounts/me", userData);
      setMsg("Profile updated successfully");
    } catch (e) {
      setErr(e.message);
    }
  }

  // Only show profile page for customers
  if (role !== "Customer") {
    return (
      <div className="center">
        <h2>Profile</h2>
        <p>Profile editing is not available for {role}s.</p>
      </div>
    );
  }

  return (
    <div className="center">
      <h2>Profile</h2>
      <div className="profile-section">
        <h3>Personal Information</h3>
        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            value={userData.name || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Contact Information</label>
          <input
            name="contactInfo"
            value={userData.contactInfo || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Identification</label>
          <input
            name="identification"
            value={userData.identification || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Balance</label>
          <input
            name="balance"
            type="number"
            value={userData.balance || 0}
            onChange={handleChange}
          />
        </div>
      </div>

      <button onClick={save}>Save Changes</button>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
