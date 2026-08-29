import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSimilarWells } from "../api";

export default function SimilarWells() {
  const { wellId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSimilarWells(wellId)
      .then((res) => setData(res))
      .catch((err) => setError(err.response?.data?.message || "Could not load similar wells."))
      .finally(() => setLoading(false));
  }, [wellId]);

  if (loading) return <div className="loading">Loading similar wells...</div>;
  if (error) return <div className="loading" style={{ color: "#dc2626" }}>{error}</div>;

  return (
    <div>
      <div className="page-title">Similar Wells</div>
      <div className="page-subtitle">
        Ranked by Similarity Score · Formation: {data.targetWell.formation || "—"}
      </div>

      {data.similarWells.map((w, i) => (
        <div key={w.wellId} className="well-list-item">
          <div>
            <strong>{i + 1}. {w.wellId}</strong> — {w.wellName}
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {w.field} · {w.formation || "Formation unknown"} · Depth {w.totalDepth} m
            </div>
          </div>
          <div style={{ fontWeight: 700, color: w.similarityScore >= 70 ? "#dc2626" : "#334155" }}>
            {w.similarityScore}
          </div>
        </div>
      ))}
    </div>
  );
}
