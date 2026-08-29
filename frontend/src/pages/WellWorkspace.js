import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchWells, getWellByWellId } from "../api";
import { useWell } from "../context/WellContext";

export default function WellWorkspace() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentWell } = useWell();

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
      // her Well model stores coords as location.coordinates = [lng, lat]
      const [lng, lat] = fullWell.location.coordinates;
      const normalizedWell = { ...fullWell, lat, lng };
      setCurrentWell(normalizedWell);
      navigate(`/well/${fullWell.wellId}/nearby-wells`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load that well.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap" style={{ background: "#f4f6f9" }}>
      <div className="card" style={{ width: 480 }}>
        <h3>Well Workspace</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Search for a well by ID to continue
        </p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search Well ID (e.g. W001)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {w.field} · {w.block}
                </div>
              </div>
              <span className={`status-tag ${w.status}`}>{w.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
