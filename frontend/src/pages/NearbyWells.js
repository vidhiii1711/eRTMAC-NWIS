import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { getNearbyWells, calculateDistanceKm } from "../api";
import { useWell } from "../context/WellContext";

export default function NearbyWells() {
  const { wellId } = useParams();
  const navigate = useNavigate();
  const { currentWell, setNearbyWells } = useWell();

  const [radius, setRadius] = useState(10);
  const [wells, setWells] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentWell) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const results = await getNearbyWells(currentWell.lat, currentWell.lng, radius);
        // backend doesn't return distance — calculate it ourselves
        const withDistance = results.map((w) => {
          const [lng, lat] = w.location.coordinates;
          return {
            ...w,
            lat,
            lng,
            distance_km: calculateDistanceKm(currentWell.lat, currentWell.lng, lat, lng),
          };
        });
        withDistance.sort((a, b) => a.distance_km - b.distance_km);
        setWells(withDistance);
        const initialChecked = {};
        withDistance.forEach((w) => (initialChecked[w.wellId] = true));
        setChecked(initialChecked);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load nearby wells.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentWell, radius]);

  function toggle(id) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }

  function handleContinue() {
    const selected = wells.filter((w) => checked[w.wellId]);
    setNearbyWells(selected);
    navigate(`/well/${wellId}/dashboard`);
  }

  if (!currentWell) return <div className="loading">No well selected. Go back and search for one.</div>;
  if (loading) return <div className="loading">Loading nearby wells...</div>;

  const center = [currentWell.lat, currentWell.lng];

  return (
    <div className="card">
      <h3>Nearby Well Discovery</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
        Current Well: <strong>{currentWell.wellId}</strong> · {currentWell.field}
      </p>

      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        {[5, 10, 25].map((r) => (
          <button
            key={r}
            className={r === radius ? "primary" : "secondary"}
            style={{ marginRight: 8 }}
            onClick={() => setRadius(r)}
          >
            {r} km
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div style={{ height: 320, borderRadius: 8, overflow: "hidden" }}>
          <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Circle center={center} radius={radius * 1000} pathOptions={{ color: "#3b82f6", fillOpacity: 0.05 }} />
            <Marker position={center}>
              <Popup>★ Current Well: {currentWell.wellId}</Popup>
            </Marker>
            {wells.map((w) => (
              <Marker key={w.wellId} position={[w.lat, w.lng]}>
                <Popup>{w.wellId} — {w.distance_km} km</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            {wells.length} nearby wells found
          </div>
          {wells.map((w) => (
            <label key={w.wellId} className="well-list-item" style={{ cursor: "pointer" }}>
              <div>
                <input
                  type="checkbox"
                  checked={!!checked[w.wellId]}
                  onChange={() => toggle(w.wellId)}
                  style={{ width: "auto", marginRight: 8 }}
                />
                <strong>{w.wellId}</strong>
                <span style={{ color: "#64748b", fontSize: 12 }}> · {w.wellName}</span>
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>{w.distance_km} km</span>
            </label>
          ))}
        </div>
      </div>

      <div className="btn-row">
        <button className="secondary" onClick={() => navigate(-1)}>Back</button>
        <button className="primary" onClick={handleContinue}>Continue →</button>
      </div>
    </div>
  );
}
