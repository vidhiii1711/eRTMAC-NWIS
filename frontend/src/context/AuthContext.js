import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(null); // { employeeId, employeeName, token }
  const [loading, setLoading] = useState(true);

  // On page load/refresh, check if we already have a saved login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const employeeId = localStorage.getItem("employeeId");
    const employeeName = localStorage.getItem("employeeName");
    if (token && employeeId) {
      setEmployee({ token, employeeId, employeeName });
    }
    setLoading(false);
  }, []);

  function login(data) {
    // data = { _id, employeeId, employeeName, token } — exact shape from her /api/auth/login
    localStorage.setItem("token", data.token);
    localStorage.setItem("employeeId", data.employeeId);
    localStorage.setItem("employeeName", data.employeeName);
    setEmployee(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("employeeName");
    setEmployee(null);
  }

  return (
    <AuthContext.Provider value={{ employee, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
