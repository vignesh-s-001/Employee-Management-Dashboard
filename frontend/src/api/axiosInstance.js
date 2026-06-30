import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

// Use the live backend URL in production, and local proxy in development
const BASE_URL = import.meta.env.PROD 
  ? 'https://employee-management-dashboard-9zwh.vercel.app'
  : '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
