import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { wellId } = useParams();
  const { employee, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 600) {
      setCollapsed(true);
    }
  }, []);

  const links = [
    { to: `/well/${wellId}/dashboard`, label: "Dashboard", icon: "📊" },
    { to: `/well/${wellId}/nearby-wells`, label: "Nearby Wells", icon: "📍" },
    { to: `/well/${wellId}/similar-wells`, label: "Similar Wells", icon: "🔗" },
    { to: `/well/${wellId}/document-search`, label: "Document Search", icon: "📄" },
  ];

  return (
    <>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        {/* NWIS + collapse arrow */}
        <div className="sidebar-header">
          <h2>NWIS</h2>

          <button
            className="sidebar-arrow"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <div className="engineer">
          Engineer: {employee?.employeeName || "Guest"}
        </div>

        {links.map((l) => (
          <NavLink
            key={l.label}
            to={l.to}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => {
              if (window.innerWidth <= 600) setCollapsed(true);
            }}
          >
            <span style={{ marginRight: 8 }}>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}

        <button
          onClick={logout}
          style={{
            cursor: "pointer",
            marginTop: 20,
            color: "#f87171",
            display: "block",
            padding: "10px 20px",
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          <span>Logout</span>
        </button>
      </div>

      {/* Arrow remains visible when sidebar is completely closed */}
      {collapsed && (
        <button
          className="sidebar-arrow-closed"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          →
        </button>
      )}
    </>
  );
}