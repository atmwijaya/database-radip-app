import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../components/navbarAdmin';
import Footer from '../../components/footer';

const BerandaAdmin = () => {
    // dummy data
  const [angkatanData, setAngkatanData] = useState([
    { year: 2025, count: 45 },
    { year: 2024, count: 38 },
    { year: 2023, count: 42 },
    { year: 2022, count: 35 },
    { year: 2021, count: 28 },
  ]);

  const [totalAnggota, setTotalAnggota] = useState(0);
  const [showAllAngkatan, setShowAllAngkatan] = useState(false);

  useEffect(() => {
    const total = angkatanData.reduce((sum, item) => sum + item.count, 0);
    setTotalAnggota(total);
  }, [angkatanData]);
// Dummy data for all angkatan
  const allAngkatanData = [
    { year: 2025, count: 45 },
    { year: 2024, count: 38 },
    { year: 2023, count: 42 },
    { year: 2022, count: 35 },
    { year: 2021, count: 28 },
    { year: 2020, count: 25 },
    { year: 2019, count: 22 },
    { year: 2018, count: 20 },
  ];

  const toggleShowAllAngkatan = () => {
    if (showAllAngkatan) {
      setAngkatanData(allAngkatanData.slice(0, 5));
    } else {
      setAngkatanData(allAngkatanData);
    }
    setShowAllAngkatan(!showAllAngkatan);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>
        
        {/* Statistik Total Anggota */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistik Anggota Racana Diponegoro</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Anggota</p>
              <p className="text-4xl font-bold text-blue-900">{totalAnggota}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Statistik per Angkatan */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Anggota per Angkatan</h2>
            <button 
              onClick={toggleShowAllAngkatan}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {showAllAngkatan ? 'Lihat 5 Angkatan Terbaru' : 'Lihat Semua Angkatan'}
            </button>
          </div>
          
          <div className="space-y-4">
            {angkatanData.map((item) => (
              <div key={item.year} className="flex items-center">
                <div className="w-16 font-medium text-gray-700">Angkatan {item.year}</div>
                <div className="flex-1 mx-4">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500" 
                      style={{ width: `${(item.count / totalAnggota) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right font-medium text-gray-700">{item.count} orang</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer yang selalu di bagian bawah */}
      <Footer />
    </div>
  );
};

export default BerandaAdmin;