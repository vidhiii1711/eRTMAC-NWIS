import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { wellId } = useParams();
  const { employee, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: `/well/${wellId}/dashboard`, label: "Dashboard", icon: "📊" },
    { to: `/well/${wellId}/nearby-wells`, label: "Nearby Wells", icon: "📍" },
    { to: `/well/${wellId}/similar-wells`, label: "Similar Wells", icon: "🔗" },
    { to: `/well/${wellId}/document-search`, label: "Document Search", icon: "📄" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "→" : "← Collapse"}
      </button>
      <h2>NWIS</h2>
      <div className="engineer">Engineer: {employee?.employeeName || "Guest"}</div>
      {links.map((l) => (
        <NavLink key={l.label} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
          <span style={{ marginRight: 8 }}>{l.icon}</span>
          <span>{l.label}</span>
        </NavLink>
      ))}
      <a onClick={logout} style={{ cursor: "pointer", marginTop: 20, color: "#f87171", display: "block", padding: "10px 20px" }}>
        <span>Logout</span>
      </a>
    </div>
  );
}
