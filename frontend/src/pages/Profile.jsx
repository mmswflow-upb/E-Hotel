import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import profileIcon from "../assets/profile.png";
import phoneIcon from "../assets/phone-call.png";
import idCardIcon from "../assets/id-card.png";
import moneyIcon from "../assets/money.png";
import approvedIcon from "../assets/approved.png";
import deniedIcon from "../assets/denied.png";

export default function Profile() {
  const { role } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [userData, setUserData] = useState({});
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        showLoading();
        const response = await api.get("/accounts/me");
        setUserData(response.data);
      } catch (e) {
        setErr(e.message);
      } finally {
        hideLoading();
      }
    };

    fetchUserData();
  }, [role]);

  // Add effect to clear success message after 3 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  function handleChange(e) {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }

  async function save() {
    setErr("");
    setMsg("");
    try {
      showLoading();
      await api.put("/accounts/me", userData);
      setMsg("Profile updated successfully");
    } catch (e) {
      // Extract error message from response if available
      const errorMessage = e.response?.data?.error || e.message;
      setErr(errorMessage);
    } finally {
      hideLoading();
    }
  }

  // Only show profile page for customers
  if (role !== "Customer") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <img
                src={profileIcon}
                alt="Profile"
                className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
              />
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Profile
              </h2>
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Profile editing is not available for {role}s.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <img
              src={profileIcon}
              alt="Profile"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Profile
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={profileIcon}
                        alt="Name"
                        className="h-4 w-4 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Name
                    </div>
                  </label>
                  <input
                    name="name"
                    value={userData.name || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={phoneIcon}
                        alt="Phone"
                        className="h-4 w-4 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Phone Number
                    </div>
                  </label>
                  <input
                    name="phoneNumber"
                    value={userData.phoneNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={idCardIcon}
                        alt="ID Type"
                        className="h-4 w-4 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      ID Type
                    </div>
                  </label>
                  <select
                    name="idType"
                    value={userData.idType || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="id_card">ID Card</option>
                    <option value="driver_license">Driver's License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={idCardIcon}
                        alt="ID Number"
                        className="h-4 w-4 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      ID Number
                    </div>
                  </label>
                  <input
                    name="idNumber"
                    value={userData.idNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={moneyIcon}
                        alt="Balance"
                        className="h-4 w-4 dark:invert dark:brightness-0 dark:opacity-80"
                      />
                      Balance
                    </div>
                  </label>
                  <input
                    name="balance"
                    type="number"
                    value={userData.balance || 0}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={save}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
            >
              Save Changes
            </button>

            {msg && (
              <div className="flex items-center justify-center gap-2">
                <img src={approvedIcon} alt="Success" className="h-5 w-5" />
                <p className="text-green-500">{msg}</p>
              </div>
            )}
            {err && (
              <div className="flex items-center justify-center gap-2">
                <img
                  src={deniedIcon}
                  alt="Error"
                  className="h-5 w-5 filter brightness-0 saturate-100 invert-0 sepia-100 saturate-1000 hue-rotate-0 brightness-100 contrast-100"
                />
                <p className="text-red-500">{err}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
