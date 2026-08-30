import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmployee, registerEmployee } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await loginEmployee(employeeId, password)
          : await registerEmployee(employeeId, employeeName, password);
      login(data);
      navigate("/well-workspace");
    } catch (err) {
      setError(err.response?.data?.message || `${mode === "login" ? "Login" : "Registration"} failed.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>NWIS</h1>
        <p>
          {mode === "login"
            ? "National Well Intelligence System — Sign in to continue"
            : "Create your engineer account"}
        </p>

        <label>Employee ID</label>
        <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />

        {mode === "register" && (
          <>
            <label>Full Name</label>
            <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
          </>
        )}

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <button className="primary" style={{ width: "100%", marginTop: 24 }} type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#94a3b8" }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            style={{ color: "#60a5fa", cursor: "pointer", fontWeight: 600 }}
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}
