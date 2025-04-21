import axios from "axios";
import { auth } from "../firebase";

const baseURL = "http://localhost:3000/api";
const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const t = await user.getIdToken();
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});
export default api;
