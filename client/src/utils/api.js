// Configure axios globally so every import { axios } usage gets the right baseURL.
// In development Vite proxies /api -> localhost:5000, so baseURL is effectively
// relative. In production the baseURL points at the deployed Render backend.
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Attach the stored JWT to every request automatically.
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('tomorrow_user') || 'null');
  const admin = JSON.parse(localStorage.getItem('tomorrow_admin') || 'null');
  const token = user?.token || admin?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
