import React, { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = (data) => {
    const merged = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  const is = (...roles) => roles.includes(user?.role);
  const isAdmin = () => is("admin");
  const isChef = () => is("admin", "chef_agence");
  const isStaff = () => is("admin", "chef_agence", "agent");

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        is,
        isAdmin,
        isChef,
        isStaff,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
