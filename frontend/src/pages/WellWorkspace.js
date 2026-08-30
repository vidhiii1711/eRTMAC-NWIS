import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchWells, getWellByWellId } from "../api";
import { useWell } from "../context/WellContext";
import { useAuth } from "../context/AuthContext";

export default function WellWorkspace() {
  const [tab, setTab] = useState("existing"); // "existing" or "new"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentWell } = useWell();
  const { employee } = useAuth();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const wells = await searchWells(query.trim());
      setResults(wells);
      if (wells.length === 0) setError("No wells found matching that ID.");
    } catch (err) {
      setError(err.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function selectWell(wellId) {
    setLoading(true);
    try {
      const fullWell = await getWellByWellId(wellId);
      const [lng, lat] = fullWell.location.coordinates;
      setCurrentWell({ ...fullWell, lat, lng });
     navigate(`/well/${fullWell.wellId}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load that well.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace-wrap">
      <div className="workspace-header">
        <h1>NWIS</h1>
        <p>Welcome back, {employee?.employeeName || "Engineer"}</p>
      </div>

      <div className="workspace-card">
        <div className="tab-row">
          <button
            className={`tab-btn ${tab === "existing" ? "active" : ""}`}
            onClick={() => setTab("existing")}
          >
            🔍 Existing Well
          </button>
          <button
            className={`tab-btn ${tab === "new" ? "active" : ""}`}
            onClick={() => setTab("new")}
          >
            ➕ Create New Well
          </button>
        </div>

        {tab === "existing" && (
          <div style={{ padding: 24 }}>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
              Search for an existing well by its Well ID to continue
            </p>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Search Well ID (e.g. W001)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button className="primary" type="submit" disabled={loading}>
                {loading ? "..." : "Search"}
              </button>
            </form>

            {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>}

            <div style={{ marginTop: 16 }}>
              {results.map((w) => (
                <div className="well-list-item" key={w.wellId} onClick={() => selectWell(w.wellId)}>
                  <div>
                    <strong>{w.wellId}</strong> — {w.wellName}
                    <div style={{ fontSize: 12, color: "#64748b" }}>{w.field} · {w.block}</div>
                  </div>
                  <span className={`status-tag ${w.status}`}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "new" && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Set up a new well profile with location, formation and depth details.
            </p>
            <button className="primary" onClick={() => navigate("/create-well")}>
              + Start New Well Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
