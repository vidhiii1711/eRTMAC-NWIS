import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { wellId } = useParams();
  const { employee, logout } = useAuth();

  const links = [
    { to: `/well/${wellId}/dashboard`, label: "Dashboard (Risk + Search)" },
    { to: `/well/${wellId}/similar-wells`, label: "Similar Wells" },
  ];

  return (
    <div className="sidebar">
      <h2>NWIS</h2>
      <div className="engineer">Engineer: {employee?.employeeName || "Guest"}</div>
      {links.map((l) => (
        <NavLink key={l.label} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
          {l.label}
        </NavLink>
      ))}
      <a onClick={logout} style={{ cursor: "pointer", marginTop: 20, color: "#f87171" }}>Logout</a>
    </div>
  );
}
