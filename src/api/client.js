import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export const endpoints = {
  students: "/students",
  attendance: "/attendance",
  sessions: "/sessions",
  activeSession: "/sessions/active",
  management: "/management",
  deviceLogs: "/api/device/logs",
};
