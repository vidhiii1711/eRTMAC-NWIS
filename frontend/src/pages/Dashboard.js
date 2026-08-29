import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRiskPrediction, askHistoricalQuestion, getSimilarWells } from "../api";
import { useWell } from "../context/WellContext";

function riskLevel(pct) {
  if (pct >= 60) return "high";
  if (pct >= 30) return "medium";
  return "low";
}

export default function Dashboard() {
  const { wellId } = useParams();
  const { currentWell } = useWell();

  const [risk, setRisk] = useState(null);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!currentWell) return;
    async function load() {
      setLoading(true);
      // 1. Get risk predictions (mock logic until /predict-risk is real)
      const riskData = await getRiskPrediction(currentWell.totalDepth, currentWell.formation);
      setRisk(riskData);

      // 2. Build Early Warning by checking similar wells for high-similarity matches
      //    This is the honest version of "Early Warning" — no separate ML model,
      //    just comparing current well against similar historical wells.
      try {
        const similarData = await getSimilarWells(currentWell.wellId, 5);
        const closeMatches = similarData.similarWells.filter((w) => w.similarityScore >= 60);
        if (closeMatches.length > 0) {
          setEarlyWarning({
            triggered: true,
            count: closeMatches.length,
            topMatch: closeMatches[0],
          });
        } else {
          setEarlyWarning({ triggered: false });
        }
      } catch {
        setEarlyWarning({ triggered: false });
      }

      setLoading(false);
    }
    load();
  }, [currentWell]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    const res = await askHistoricalQuestion(question);
    setAnswer(res);
    setAsking(false);
  }

  if (!currentWell) return <div className="loading">No well selected.</div>;
  if (loading || !risk) return <div className="loading">Loading dashboard...</div>;

  const risks = [
    { label: "Mud Loss Risk", value: risk.mud_loss_risk },
    { label: "Stuck Pipe Risk", value: risk.stuck_pipe_risk },
    { label: "Overpressure Risk", value: risk.overpressure_risk },
  ];

  return (
    <div>
      <div className="page-title">Well: {currentWell.wellId} <span style={{ fontSize: 13, color: "#16a34a" }}>● {currentWell.status}</span></div>
      <div className="page-subtitle">
        Field: {currentWell.field} · Depth: {currentWell.totalDepth} m · Formation: {currentWell.formation || "—"}
      </div>

      {/* EARLY WARNING BANNER */}
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

      <div className="card">
        <h3>Historical Document Search</h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
          e.g. "What happened around 2900m?"
        </p>
        <form onSubmit={handleAsk} style={{ display: "flex", gap: 8 }}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about nearby well history..." />
          <button className="primary" type="submit" disabled={asking}>
            {asking ? "Searching..." : "Ask"}
          </button>
        </form>
        {answer && (
          <div style={{ marginTop: 12, background: "#f8fafc", padding: 12, borderRadius: 8, fontSize: 14 }}>
            <p>{answer.answer}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>Source: {answer.source}</p>
          </div>
        )}
      </div>

      <div className="tagline">AI Predicts • Analytics Compares • Engineer Decides</div>
    </div>
  );
}
