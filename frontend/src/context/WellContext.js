import React, { createContext, useContext, useState } from "react";

const WellContext = createContext(null);

export function WellProvider({ children }) {
  const [currentWell, setCurrentWell] = useState(null);
  const [nearbyWells, setNearbyWells] = useState([]);

  return (
    <WellContext.Provider
      value={{ currentWell, setCurrentWell, nearbyWells, setNearbyWells }}
    >
      {children}
    </WellContext.Provider>
  );
}

export function useWell() {
  const ctx = useContext(WellContext);
  if (!ctx) throw new Error("useWell must be used inside WellProvider");
  return ctx;
}
