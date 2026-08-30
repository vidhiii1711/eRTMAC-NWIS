import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRiskPrediction, getSimilarWells } from "../api";
import { useWell } from "../context/WellContext";
import RiskCard from "../components/RiskCard";

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
      try {
      const riskData = await getRiskPrediction(currentWell.wellId);
      setRisk(riskData);

        const similarData = await getSimilarWells(currentWell.wellId, 5);
        const closeMatches = similarData.similarWells.filter((w) => w.similarityScore >= 60);
        setEarlyWarning(
          closeMatches.length > 0
            ? { triggered: true, count: closeMatches.length, topMatch: closeMatches[0] }
            : { triggered: false }
        );
      } catch (error) {
        console.error("Dashboard API error:", error);
        setEarlyWarning({ triggered: false });
      }finally {
      setLoading(false);
    }}
    load();
  }, [currentWell]);

  if (!currentWell) return <div className="loading">No well selected.</div>;
  if (loading || !risk) return <div className="loading">Loading dashboard...</div>;

  const risks = [
  {
    label: "Mud Loss Risk",
    value: risk.prediction.Mud_Loss_Label.probability,
  },
  {
    label: "Stuck Pipe Risk",
    value: risk.prediction.Stuck_Pipe_Label.probability,
  },
  {
    label: "Kick Risk",
    value: risk.prediction.Kick_Label.probability,
  },
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

       {/* RISK CARDS — now real data + Why? explanation */}
      {risk ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 16,
          }}
        >
          <RiskCard
            title="Mud Loss Risk"
            riskKey="Mud_Loss_Label"
            riskData={risk.prediction.Mud_Loss_Label}
            wellId={currentWell.wellId}
          />
          <RiskCard
            title="Stuck Pipe Risk"
            riskKey="Stuck_Pipe_Label"
            riskData={risk.prediction.Stuck_Pipe_Label}
            wellId={currentWell.wellId}
          />
          <RiskCard
            title="Kick Risk"
            riskKey="Kick_Label"
            riskData={risk.prediction.Kick_Label}
            wellId={currentWell.wellId}
          />
        </div>
      ) : (
        <p style={{ color: "#dc2626", marginTop: 16 }}>Could not load risk predictions for this well.</p>
      )}

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
