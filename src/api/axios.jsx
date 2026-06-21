import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

// 🔥 Attach token automatically for every request
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;