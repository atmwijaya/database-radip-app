import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Beranda from "./pages/beranda.jsx";
import DatabaseAnggota from "./pages/databaseAnggota.jsx";
import FAQ from './pages/faq.jsx';
import BerandaAdmin from './admin/pages/berandaAdmin.jsx';
import DatabaseAdmin from './admin/pages/databaseAdmin.jsx';
import LoginPage from './admin/pages/loginPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/daftar-anggota" element={<DatabaseAnggota />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={<BerandaAdmin />} />
        <Route path="/admin/database-anggota" element={<DatabaseAdmin />} />
        <Route path="/enter" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App;