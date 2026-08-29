import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmployee } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginEmployee(employeeId, password);
      login(data); // saves token + employee info, matches her /api/auth/login response
      navigate("/well-workspace");
    } catch (err) {
      // Her backend returns { message: "Invalid employee ID or password" } on 401
      setError(err.response?.data?.message || "Login failed. Check your Employee ID and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={handleLogin}>
        <h1>NWIS</h1>
        <p>National Well Intelligence System — Sign in to continue</p>

        <label>Employee ID</label>
        <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <button className="primary" style={{ width: "100%", marginTop: 24 }} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
