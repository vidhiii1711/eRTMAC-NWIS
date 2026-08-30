import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getWellByWellId } from "../api";
import { useWell } from "../context/WellContext";

export default function Layout() {
  const { wellId } = useParams();
  const { currentWell, setCurrentWell } = useWell();
  const [well, setWell] = useState(currentWell);

  useEffect(() => {
    async function ensureWell() {
      if (currentWell && currentWell.wellId === wellId) {
        setWell(currentWell);
        return;
      }
      try {
        const fullWell = await getWellByWellId(wellId);
        const [lng, lat] = fullWell.location.coordinates;
        const normalized = { ...fullWell, lat, lng };
        setCurrentWell(normalized);
        setWell(normalized);
      } catch {
        // silently ignore — top bar will just show wellId only
      }
    }
    ensureWell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellId]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="top-navbar">
          <div>
            <strong>{wellId}</strong> {well?.wellName ? `— ${well.wellName}` : ""}
          </div>
          <div className="well-meta">
            <span>Field: <strong>{well?.field || "—"}</strong></span>
            <span>Block: <strong>{well?.block || "—"}</strong></span>
            <span>Depth: <strong>{well?.totalDepth ? `${well.totalDepth} m` : "—"}</strong></span>
            <span>Formation: <strong>{well?.formation || "—"}</strong></span>
            <span>Status: <strong>{well?.status || "—"}</strong></span>
          </div>
        </div>
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
