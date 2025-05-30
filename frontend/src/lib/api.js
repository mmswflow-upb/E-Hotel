import axios from "axios";
import { auth } from "../firebase";

if (!import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL environment variable is not set");
}

const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      console.log(
        "Auth token retrieved:",
        token ? "Token present" : "No token"
      );
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No authenticated user found");
    }
    return config;
  } catch (error) {
    console.error("Error setting auth token:", error);
    return config;
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Response:", error.response);
    }
    return Promise.reject(error);
  }
);

export default api;
