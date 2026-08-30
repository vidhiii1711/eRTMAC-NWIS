import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRiskPrediction, getEarlyWarning } from "../api";
import { useWell } from "../context/WellContext";
import RiskCard from "../components/RiskCard";

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

        const warningData = await getEarlyWarning(currentWell.wellId, 20, 100);
        setEarlyWarning(warningData);
      } catch (error) {
        console.error("Dashboard API error:", error);
        setEarlyWarning(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentWell]);

  if (!currentWell) return <div className="loading">No well selected.</div>;
  if (loading || !risk) return <div className="loading">Loading dashboard...</div>;

  const levelStyles = {
    HIGH: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", icon: "⚠️" },
    MEDIUM: { bg: "#fffbeb", border: "#fde68a", text: "#b45309", icon: "⚠️" },
    LOW: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", icon: "✅" },
  };

  const quickActions = [
    { label: "📍 Nearby Wells", desc: "Map + radius search for offset wells", to: `/well/${wellId}/nearby-wells` },
    { label: "🔗 Similar Wells", desc: "Ranked by similarity score", to: `/well/${wellId}/similar-wells` },
    { label: "📄 Document Search", desc: "Ask about historical WCR/DDR reports", to: `/well/${wellId}/document-search` },
  ];

  return (
    <div>
      <div className="page-title">Well: {currentWell.wellId} <span style={{ fontSize: 13, color: "#16a34a" }}>● {currentWell.status}</span></div>
      <div className="page-subtitle">
        Field: {currentWell.field} · Depth: {currentWell.totalDepth} m · Formation: {risk?.formation || "—"}
      </div>

      {/* EARLY WARNING — real endpoint (risk model + historical events combined) */}
      {earlyWarning && (() => {
        const style = levelStyles[earlyWarning.level] || levelStyles.LOW;
        return (
          <div className="card" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
            <h3 style={{ color: style.text, margin: 0 }}>
              {style.icon} Early Warning — {earlyWarning.level} Risk Zone
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 12px" }}>
              Checked {earlyWarning.nearbyWellsChecked?.length || 0} nearby well(s) at depth {earlyWarning.depth} m
            </p>

            {earlyWarning.warnings?.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                {earlyWarning.warnings.map((w, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        marginRight: 6,
                        background: w.type === "ML" ? "#e0e7ff" : "#fce7f3",
                        color: w.type === "ML" ? "#4338ca" : "#be185d",
                      }}
                    >
                      {w.type}
                    </span>
                    {w.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 14, margin: 0 }}>No significant risk factors detected ahead.</p>
            )}

            {earlyWarning.historical_events?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Relevant historical events:</p>
                {earlyWarning.historical_events.map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: 13,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: 8,
                      marginBottom: 6,
                    }}
                  >
                    <strong>{e.well_id}</strong> — {e.event_type} at {e.depth} m ({e.formation}),{" "}
                    {Math.round(e.distance_ahead)} m ahead · Severity: {e.severity}
                    <div style={{ color: "#64748b", marginTop: 4 }}>
                      Action taken: {e.action} → Outcome: {e.outcome}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* RISK CARDS — real data + Why? explanation */}
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