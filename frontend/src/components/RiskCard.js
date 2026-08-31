import React, { useState } from "react";
import { getRiskExplanation } from "../api";
import { translateFeatureName } from "../utils/featureDictionary";

// riskKey must exactly match her dict keys: "Mud_Loss_Label" | "Stuck_Pipe_Label" | "Kick_Label"
export default function RiskCard({ title, riskKey, riskData, wellId }) {
  const [showExplain, setShowExplain] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const levelColors = {
    LOW: "#16a34a",
    MEDIUM: "#ca8a04",
    HIGH: "#dc2626",
  };

  const color = levelColors[riskData?.risk_level] || "#64748b";

  async function handleWhyClick() {
    if (explanation) {
      setShowExplain((prev) => !prev);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getRiskExplanation(wellId);
      const thisRiskExplanation = res.explanation[riskKey];
      setExplanation(thisRiskExplanation);
      setShowExplain(true);
    } catch (err) {
      setError("Could not load explanation. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: 16,
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <span
          style={{
            background: color,
            color: "#fff",
            padding: "2px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {riskData?.risk_level || "N/A"}
        </span>
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color }}>
        {riskData?.probability != null ? `${riskData.probability}%` : "--"}
      </div>

      <button
        onClick={handleWhyClick}
        disabled={loading}
        style={{
          marginTop: 10,
          fontSize: 13,
          background: "none",
          border: "1px solid #cbd5e1",
          borderRadius: 6,
          padding: "4px 10px",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : showExplain ? "Hide explanation ▲" : "Why? ▼"}
      </button>

      {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{error}</p>}

      {showExplain && explanation && (
        <div
          style={{
            marginTop: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 12,
          }}
        >
         <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
  Top 5 factors behind this prediction, ranked by how much each one
  pushed the risk up or down.
</p>

          {explanation.map((item, idx) => {
            const isPushingUp = item.SHAP_Value > 0;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: idx < explanation.length - 1 ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{translateFeatureName(item.Feature)}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    Recorded value:{" "}
                    {typeof item.Feature_Value === "number"
                      ? item.Feature_Value.toFixed(2)
                      : item.Feature_Value}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isPushingUp ? "#dc2626" : "#16a34a",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {isPushingUp ? "↑ increased risk" : "↓ decreased risk"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}