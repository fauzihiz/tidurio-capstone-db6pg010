import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // Ganti ke URL backend kamu
});

// Interceptor untuk JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
export const logSleep = (data) => API.post("/sleep", data);
export const fetchDashboard = () => API.get("/dashboard");
