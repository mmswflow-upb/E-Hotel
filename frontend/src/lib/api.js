import axios from "axios";
import { auth } from "../firebase";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
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
      // Handle unauthorized access
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default api;
