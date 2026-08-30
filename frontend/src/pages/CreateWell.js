import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWell } from "../api";
import { useWell } from "../context/WellContext";

export default function CreateWell() {
  const [form, setForm] = useState({
    wellId: "",
    wellName: "",
    field: "",
    block: "",
    latitude: "",
    longitude: "",
    wellType: "Development",
    spudDate: "",
    completionDate: "",
    totalDepth: "",
    status: "Drilling",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentWell } = useWell();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createWell(form);
      const [lng, lat] = created.location.coordinates;
      setCurrentWell({ ...created, lat, lng });
      navigate(`/well/${created.wellId}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create well.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Create New Well</h3>
      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

      <div className="grid-2">
        <div>
          <label>Well ID</label>
          <input required value={form.wellId} onChange={(e) => update("wellId", e.target.value)} placeholder="W001" />
        </div>
        <div>
          <label>Well Name</label>
          <input required value={form.wellName} onChange={(e) => update("wellName", e.target.value)} />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Field</label>
          <input value={form.field} onChange={(e) => update("field", e.target.value)} />
        </div>
        <div>
          <label>Block</label>
          <input value={form.block} onChange={(e) => update("block", e.target.value)} />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Latitude</label>
          <input required value={form.latitude} onChange={(e) => update("latitude", e.target.value)} placeholder="26.12345" />
        </div>
        <div>
          <label>Longitude</label>
          <input required value={form.longitude} onChange={(e) => update("longitude", e.target.value)} placeholder="92.12345" />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Well Type</label>
          <select value={form.wellType} onChange={(e) => update("wellType", e.target.value)}>
            <option>Development</option>
            <option>Exploration</option>
            <option>Appraisal</option>
          </select>
        </div>
        <div>
          <label>Total Depth (m)</label>
          <input required type="number" value={form.totalDepth} onChange={(e) => update("totalDepth", e.target.value)} />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Spud Date</label>
          <input type="date" value={form.spudDate} onChange={(e) => update("spudDate", e.target.value)} />
        </div>
        <div>
          <label>Status</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option>Drilling</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="secondary" onClick={() => navigate(-1)}>Cancel</button>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Creating..." : "Create Well →"}
        </button>
      </div>
    </form>
  );
}
