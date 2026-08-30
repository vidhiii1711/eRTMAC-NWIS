import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRiskPrediction, getSimilarWells } from "../api";
import { useWell } from "../context/WellContext";

function riskLevel(pct) {
  if (pct >= 60) return "high";
  if (pct >= 30) return "medium";
  return "low";
}

export default function Dashboard() {
  const { wellId } = useParams();
  const { currentWell } = useWell();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWell) return;
    async function load() {
      setLoading(true);
      const riskData = await getRiskPrediction(currentWell.totalDepth, currentWell.formation);
      setRisk(riskData);

      try {
        const similarData = await getSimilarWells(currentWell.wellId, 5);
        const closeMatches = similarData.similarWells.filter((w) => w.similarityScore >= 60);
        setEarlyWarning(
          closeMatches.length > 0
            ? { triggered: true, count: closeMatches.length, topMatch: closeMatches[0] }
            : { triggered: false }
        );
      } catch {
        setEarlyWarning({ triggered: false });
      }
      setLoading(false);
    }
    load();
  }, [currentWell]);

  if (!currentWell) return <div className="loading">No well selected.</div>;
  if (loading || !risk) return <div className="loading">Loading dashboard...</div>;

  const risks = [
    { label: "Mud Loss Risk", value: risk.mud_loss_risk },
    { label: "Stuck Pipe Risk", value: risk.stuck_pipe_risk },
    { label: "Overpressure Risk", value: risk.overpressure_risk },
  ];

  const quickActions = [
    { label: "📍 Nearby Wells", desc: "Map + radius search for offset wells", to: `/well/${wellId}/nearby-wells` },
    { label: "🔗 Similar Wells", desc: "Ranked by similarity score", to: `/well/${wellId}/similar-wells` },
    { label: "📄 Document Search", desc: "Ask about historical WCR/DDR reports", to: `/well/${wellId}/document-search` },
  ];

  return (
    <div>
      <div className="page-title">Well: {currentWell.wellId} <span style={{ fontSize: 13, color: "#16a34a" }}>● {currentWell.status}</span></div>
      <div className="page-subtitle">
        Field: {currentWell.field} · Depth: {currentWell.totalDepth} m · Formation: {currentWell.formation || "—"}
      </div>

      {earlyWarning?.triggered && (
        <div className="card" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ color: "#dc2626" }}>⚠️ Early Warning — Approaching a Historically Risky Zone</h3>
          <p style={{ fontSize: 14 }}>
            {earlyWarning.count} similar well{earlyWarning.count > 1 ? "s" : ""} found at comparable depth/formation.
            Closest match: <strong>{earlyWarning.topMatch.wellId}</strong> (similarity {earlyWarning.topMatch.similarityScore}).
          </p>
        </div>
      )}

      <div className="grid-3">
        {risks.map((r) => {
          const level = riskLevel(r.value);
          return (
            <div key={r.label} className={`risk-card ${level}`}>
              <div className="risk-pct">{r.value}%</div>
              <div className="risk-label">{r.label} — {level}</div>
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop: 20, marginBottom: 12, fontSize: 15 }}>Explore This Well</h3>
      <div className="grid-3">
        {quickActions.map((a) => (
          <div key={a.label} className="card" style={{ cursor: "pointer", textAlign: "center" }} onClick={() => navigate(a.to)}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="tagline">AI Predicts • Analytics Compares • Engineer Decides</div>
    </div>
  );
}
