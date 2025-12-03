import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem("pft_user");
  return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
  setUser(userData);
  localStorage.setItem("pft_user", JSON.stringify(userData));
  };

  const logout = () => {
  setUser(null);
  localStorage.removeItem("pft_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
