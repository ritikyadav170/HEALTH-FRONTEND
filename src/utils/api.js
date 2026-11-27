import axios from "axios";

// Using the backend port (assuming 5000 based on standard setup, or whatever Vite proxy uses)
// It's better to point directly to backend if no proxy is setup
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/api/hospital`, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hospital_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
