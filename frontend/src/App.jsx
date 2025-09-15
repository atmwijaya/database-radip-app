import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Beranda from "./pages/beranda.jsx";
import DatabaseAnggota from "./pages/databaseAnggota.jsx";
import FAQ from "./pages/faq.jsx";
import BerandaAdmin from "./admin/pages/berandaAdmin.jsx";
import DatabaseAdmin from "./admin/pages/databaseAdmin.jsx";
import LoginPage from "./admin/pages/loginPage.jsx";
import { checkTokenExpiration } from "../../backend/utils/auth.js";
import { isAuthenticated } from "../../backend/utils/auth.js";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isTokenValid = checkTokenExpiration();

  if (!isAuthenticated()) {
    return <Navigate to="/enter" replace />;
  }

  if (!token || !isTokenValid) {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("tokenExpiration");
    return <Navigate to="/enter" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/daftar-anggota" element={<DatabaseAnggota />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="/enter" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <BerandaAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/database-anggota" element={
          <ProtectedRoute>
          <DatabaseAdmin />
          </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
