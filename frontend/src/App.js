import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WellProvider } from "./context/WellContext";

import Login from "./pages/Login";
import WellWorkspace from "./pages/WellWorkspace";
import CreateWell from "./pages/CreateWell";
import NearbyWells from "./pages/NearbyWells";
import Dashboard from "./pages/Dashboard";
import SimilarWells from "./pages/SimilarWells";
import DocumentSearch from "./pages/DocumentSearch";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
  const { employee, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!employee) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/well-workspace" element={<ProtectedRoute><WellWorkspace /></ProtectedRoute>} />
      <Route path="/create-well" element={<ProtectedRoute><CreateWell /></ProtectedRoute>} />

      {/* All well-specific pages now live under one Layout with sidebar + top bar */}
      <Route path="/well/:wellId" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="nearby-wells" element={<NearbyWells />} />
        <Route path="similar-wells" element={<SimilarWells />} />
        <Route path="document-search" element={<DocumentSearch />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WellProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </WellProvider>
    </AuthProvider>
  );
}
