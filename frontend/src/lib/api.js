import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const path = window.location.pathname;

  const isAdminArea =
    path.startsWith("/admin") ||
    path === "/login";

  const token = isAdminArea
    ? localStorage.getItem("ck_admin_token")
    : localStorage.getItem("ck_member_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Terjadi kesalahan. Silakan coba lagi.";

  if (Array.isArray(detail)) {
    return detail
      .map((e) =>
        e && typeof e.msg === "string"
          ? e.msg
          : JSON.stringify(e)
      )
      .filter(Boolean)
      .join(" ");
  }

  if (detail && typeof detail.msg === "string") {
    return detail.msg;
  }

  return String(detail);
}

export const mediaUrl = (path) =>
  `${process.env.REACT_APP_BACKEND_URL}${path}`;

export default api;