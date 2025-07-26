export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://portfolio-backend-uzey.onrender.com/api/v1"
    : "http://localhost:4000/api/v1";

export const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5173";
