// src/services/api.js
import axios from 'axios';

// Buat instance Axios dengan base URL dan interceptor
const api = axios.create({
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tidurio-capstone-db6pg010-production.up.railway.app/',
  timeout: 10000, // Timeout request dalam ms
});

// Interceptor untuk menambahkan token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Use consistent key
    console.log('API Request - URL:', config.url);
    console.log('API Request - Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request - Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response - URL:', response.config.url);
    console.log('API Response - Status:', response.status);
    console.log('API Response - Data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error - URL:', error.config?.url);
    console.error('API Response Error - Status:', error.response?.status);
    console.error('API Response Error - Data:', error.response?.data);
    return Promise.reject(error);
  }
);

// Fungsi untuk registrasi pengguna
export const registerUser = async (userData) => {
  console.log('API - Registering user:', userData.email);
  return await api.post('/register', userData);
};

// Fungsi untuk login pengguna
export const loginUser = async (credentials) => {
  console.log('API - Logging in user:', credentials.email);
  const response = await api.post('/login', credentials);
  const { accessToken } = response.data.data;
  localStorage.setItem('accessToken', accessToken); // Use consistent key
  console.log('API - Login successful, token saved');
  return response;
};

// Fungsi untuk mengambil data dashboard pengguna
export const fetchDashboard = async () => {
  console.log('API - Fetching dashboard data');
  try {
    const response = await api.get('/dashboard');
    console.log('API - Dashboard fetch successful');
    return response;
  } catch (error) {
    console.error('API - Dashboard fetch failed:', error);
    throw error;
  }
};

// Fungsi untuk mengambil profil pengguna berdasarkan ID (jika masih digunakan terpisah)
export const getUserProfile = async (userId) => {
  console.log('API - Fetching user profile for:', userId);
  return await api.get(`/users/${userId}`);
};

// --- Fungsi BARU untuk memulai sesi tidur ---
export const startSleep = async () => {
  console.log('API - Starting sleep session');
  // Endpoint ini akan mencatat waktu mulai tidur dan mengembalikan sleepLogId
  return await api.post('/sleeps/start');
};

// --- Fungsi BARU untuk mengakhiri sesi tidur ---
export const endSleep = async (sleepLogId) => {
  console.log('API - Ending sleep session:', sleepLogId);
  // Endpoint ini akan mencatat waktu selesai tidur, menghitung durasi, dan poin
  return await api.put(`/sleeps/${sleepLogId}/end`);
};