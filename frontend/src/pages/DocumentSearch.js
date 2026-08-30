import React, { useState } from "react";
import { askHistoricalQuestion } from "../api";

export default function DocumentSearch() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState([]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    const res = await askHistoricalQuestion(question);
    setAnswer(res);
    setHistory((h) => [{ question, ...res }, ...h]);
    setQuestion("");
    setAsking(false);
  }

  return (
    <div>
      <div className="page-title">Historical Document Search</div>
      <div className="page-subtitle">Ask about WCR / DDR / historical reports for nearby wells</div>

      <div className="card">
        <form onSubmit={handleAsk} style={{ display: "flex", gap: 8 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. "What happened around 2900m?"'
          />
          <button className="primary" type="submit" disabled={asking}>
            {asking ? "Searching..." : "Ask"}
          </button>
        </form>
      </div>

      {history.length === 0 && !asking && (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No questions asked yet — try the example above.</p>
      )}

      {history.map((h, i) => (
        <div className="card" key={i}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Q: {h.question}</p>
          <p style={{ fontSize: 14 }}>{h.answer}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Source: {h.source}</p>
        </div>
      ))}
    </div>
  );
}
