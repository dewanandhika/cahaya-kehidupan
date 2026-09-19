import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = unauth
  const token = localStorage.getItem("ck_token");

  useEffect(() => {
    if (!token) {
      setUser(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("ck_token");
        setUser(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ck_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("ck_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ck_token");
    setUser(false);
  };

  const can = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}
