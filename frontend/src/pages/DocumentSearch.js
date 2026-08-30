// // import React, { useState } from "react";
// // import { askHistoricalQuestion } from "../api";

// // export default function DocumentSearch() {
// //   const [question, setQuestion] = useState("");
// //   const [answer, setAnswer] = useState(null);
// //   const [asking, setAsking] = useState(false);
// //   const [history, setHistory] = useState([]);

// //   async function handleAsk(e) {
// //     e.preventDefault();
// //     if (!question.trim()) return;
// //     setAsking(true);
// //     const res = await askHistoricalQuestion(question);
// //     setAnswer(res);
// //     setHistory((h) => [{ question, ...res }, ...h]);
// //     setQuestion("");
// //     setAsking(false);
// //   }

// //   return (
// //     <div>
// //       <div className="page-title">Historical Document Search</div>
// //       <div className="page-subtitle">Ask about WCR / DDR / historical reports for nearby wells</div>

// //       <div className="card">
// //         <form onSubmit={handleAsk} style={{ display: "flex", gap: 8 }}>
// //           <input
// //             value={question}
// //             onChange={(e) => setQuestion(e.target.value)}
// //             placeholder='e.g. "What happened around 2900m?"'
// //           />
// //           <button className="primary" type="submit" disabled={asking}>
// //             {asking ? "Searching..." : "Ask"}
// //           </button>
// //         </form>
// //       </div>

// //       {history.length === 0 && !asking && (
// //         <p style={{ color: "#94a3b8", fontSize: 13 }}>No questions asked yet — try the example above.</p>
// //       )}

// //       {history.map((h, i) => (
// //         <div className="card" key={i}>
// //           <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Q: {h.question}</p>
// //           <p style={{ fontSize: 14 }}>{h.answer}</p>
// //           <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Source: {h.source}</p>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// import React, { useState } from "react";
// import { askHistoricalQuestion } from "../api";
// import { useWell } from "../context/WellContext";

// export default function DocumentSearch() {
//   const { currentWell } = useWell();
//   const [question, setQuestion] = useState("");
//   const [asking, setAsking] = useState(false);
//   const [history, setHistory] = useState([]);
//   const [error, setError] = useState("");

//   async function handleAsk(e) {
//     e.preventDefault();
//     if (!question.trim()) return;
//     setAsking(true);
//     setError("");
//     try {
//       // Pass current well ID so her API prioritizes its documents first
//       const wellIds = currentWell ? [currentWell.wellId] : [];
//       const res = await askHistoricalQuestion(question, wellIds);
//       setHistory((h) => [{ question, answer: res.answer }, ...h]);
//       setQuestion("");
//     } catch (err) {
//       setError("Could not fetch historical information. Try again.");
//     } finally {
//       setAsking(false);
//     }
//   }

//   return (
//     <div>
//       <div className="page-title">Historical Document Search</div>
//       <div className="page-subtitle">Ask about WCR / DDR / historical reports for nearby wells</div>

//       <div className="card">
//         <form onSubmit={handleAsk} style={{ display: "flex", gap: 8 }}>
//           <input
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder='e.g. "What happened around 2900m?"'
//           />
//           <button className="primary" type="submit" disabled={asking}>
//             {asking ? "Searching historical documents (may take 10-20s)..." : "Ask"}
//           </button>
//         </form>
//         {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{error}</p>}
//       </div>

//       {history.length === 0 && !asking && (
//         <p style={{ color: "#94a3b8", fontSize: 13 }}>No questions asked yet — try the example above.</p>
//       )}

//       {history.map((h, i) => (
//         <div className="card" key={i}>
//           <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Q: {h.question}</p>
//           <p style={{ fontSize: 14, whiteSpace: "pre-line" }}>{h.answer}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { askHistoricalQuestion } from "../api";
// import { useWell } from "../context/WellContext";

// export default function DocumentSearch() {
//   const { currentWell } = useWell();
//   const [question, setQuestion] = useState("");
//   const [asking, setAsking] = useState(false);
//   const [history, setHistory] = useState([]);
//   const [error, setError] = useState("");

//   async function handleAsk(e) {
//     e.preventDefault();
//     if (!question.trim()) return;
//     setAsking(true);
//     setError("");
//     try {
//       const wellIds = currentWell ? [currentWell.wellId] : [];
//       const res = await askHistoricalQuestion(question, wellIds);
//       setHistory((h) => [{ question, answer: res.answer }, ...h]);
//       setQuestion("");
//     } catch (err) {
//       setError("Could not fetch historical information. Try again.");
//     } finally {
//       setAsking(false);
//     }
//   }

//   // Splits the AI answer into paragraphs for cleaner readability
//   function renderAnswerParagraphs(answer) {
//     return answer
//       .split(/\n{1,}/)
//       .filter((p) => p.trim().length > 0)
//       .map((para, idx) => <p key={idx}>{para.trim()}</p>);
//   }

//   return (
//     <div>
//       <div className="page-title">Historical Document Search</div>
//       <div className="page-subtitle">Ask about WCR / DDR / historical reports for nearby wells</div>

//       <div className="card">
//         <form onSubmit={handleAsk} className="search-input-row">
//           <input
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder='e.g. "What happened around 2900m?"'
//           />
//           <button className="primary" type="submit" disabled={asking}>
//             {asking ? "Searching..." : "Ask"}
//           </button>
//         </form>

//         {asking && (
//           <div className="qa-loading-note">
//             <span className="dot" />
//             <span className="dot" />
//             <span className="dot" />
//             Reading historical WCR/DDR reports, this can take up to 20 seconds
//           </div>
//         )}

//         {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>}
//       </div>

//       {history.length === 0 && !asking && (
//         <div className="qa-empty">
//           <div className="qa-empty-icon">📄</div>
//           <p>No questions asked yet</p>
//           <p className="qa-hint">Try the example above to search historical drilling reports</p>
//         </div>
//       )}

//       <div className="qa-thread">
//         {history.map((h, i) => (
//           <div className="qa-item" key={i}>
//             <div className="qa-question">
//               <div className="qa-icon">Q</div>
//               <div className="qa-text">{h.question}</div>
//             </div>
//             <div className="qa-answer">
//               <div className="qa-icon">🤖</div>
//               <div className="qa-answer-body">
//                 {renderAnswerParagraphs(h.answer)}
//                 <span className="qa-tag">AI-generated from historical WCR/DDR records</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askHistoricalQuestion } from "../api";
import { useWell } from "../context/WellContext";

// Gemini sometimes writes inline math like $2905\text{ m}$ or $8\text{ bbl/hr}$.
// We don't need full LaTeX rendering for a drilling dashboard — just strip the
// LaTeX wrapper and \text{} command so it reads as plain, clean text.
function cleanMathNotation(text) {
  return text
    .replace(/\$([^$]+)\$/g, (match, inner) => inner.replace(/\\text\{([^}]*)\}/g, "$1"))
    .replace(/\\text\{([^}]*)\}/g, "$1");
}

export default function DocumentSearch() {
  const { currentWell } = useWell();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setError("");
    try {
      const wellIds = currentWell ? [currentWell.wellId] : [];
      const res = await askHistoricalQuestion(question, wellIds);
      setHistory((h) => [{ question, answer: cleanMathNotation(res.answer) }, ...h]);
      setQuestion("");
    } catch (err) {
      setError("Could not fetch historical information. Try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div>
      <div className="page-title">Historical Document Search</div>
      <div className="page-subtitle">Ask about WCR / DDR / historical reports for nearby wells</div>

      <div className="card">
        <form onSubmit={handleAsk} className="search-input-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. "What happened around 2900m?"'
          />
          <button className="primary" type="submit" disabled={asking}>
            {asking ? "Searching..." : "Ask"}
          </button>
        </form>

        {asking && (
          <div className="qa-loading-note">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            Reading historical WCR/DDR reports, this can take up to 20 seconds
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>

      {history.length === 0 && !asking && (
        <div className="qa-empty">
          <div className="qa-empty-icon">📄</div>
          <p>No questions asked yet</p>
          <p className="qa-hint">Try the example above to search historical drilling reports</p>
        </div>
      )}

      <div className="qa-thread">
        {history.map((h, i) => (
          <div className="qa-item" key={i}>
            <div className="qa-question">
              <div className="qa-icon">Q</div>
              <div className="qa-text">{h.question}</div>
            </div>
            <div className="qa-answer">
              <div className="qa-icon">🤖</div>
              <div className="qa-answer-body">
                <div className="qa-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.answer}</ReactMarkdown>
                </div>
                <span className="qa-tag">AI-generated from historical WCR/DDR records</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}