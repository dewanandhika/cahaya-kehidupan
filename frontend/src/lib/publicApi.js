import axios from "axios";

const PUB = `${process.env.REACT_APP_BACKEND_URL}/api/public`;
const pub = axios.create({ baseURL: PUB });

pub.interceptors.request.use((config) => {
  const token = localStorage.getItem("ck_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const mediaUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `${process.env.REACT_APP_BACKEND_URL}${p}`;
};

export const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
};

export default pub;
