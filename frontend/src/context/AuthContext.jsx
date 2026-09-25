import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const isAdminArea = () => {
  const path = window.location.pathname;

  return (
    path.startsWith("/admin") ||
    path === "/login"
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const adminArea = isAdminArea();

  const token = adminArea
    ? localStorage.getItem("ck_admin_token")
    : localStorage.getItem("ck_member_token");

  useEffect(() => {
    if (!token) {
      setUser(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        if (adminArea) {
          localStorage.removeItem("ck_admin_token");
        } else {
          localStorage.removeItem("ck_member_token");
        }

        setUser(false);
      });
  }, [token, adminArea]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    if (data.user?.role === "SUPER_ADMIN" ||
        data.user?.role === "EDITOR" ||
        data.user?.role === "AUTHOR") {
      localStorage.setItem("ck_admin_token", data.token);
    } else {
      localStorage.setItem("ck_member_token", data.token);
    }

    setUser(data.user);

    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return data;
  };

  const logout = () => {
    if (adminArea) {
      localStorage.removeItem("ck_admin_token");
    } else {
      localStorage.removeItem("ck_member_token");
    }

    setUser(false);
  };

  const can = (...roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}