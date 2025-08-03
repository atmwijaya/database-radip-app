import React, { useState, useEffect, useRef } from 'react';
import NavbarAdmin from '../components/navbarAdmin';
import Footer from '../../components/footer';
import { checkTokenExpiration } from '../../../../backend/utils/auth';
const BerandaAdmin = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAngkatan, setShowAllAngkatan] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const animationRef = useRef(null);

  // Fetch data from backend
  const fetchData = async () => {
    try {
       const token = localStorage.getItem('token');
      if (!token || !checkTokenExpiration()) {
        logout();
        return;
      }
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/database`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data anggota');
      }
      
      const result = await response.json();
      setMembers(result);
      setLoading(false);
      
      // Trigger animation after data is loaded
      setTimeout(() => {
        setIsAnimated(true);
      }, 100);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !checkTokenExpiration()) {
      logout();
      return;
    }

    fetchData();

    // Set up token expiration check every minute
    const tokenCheckInterval = setInterval(() => {
      if (!checkTokenExpiration()) {
        logout();
      }
    }, 60000);

    return () => {
      clearInterval(tokenCheckInterval);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Calculate statistics
  const calculateStatistics = () => {
    const angkatanMap = new Map();
    
    members.forEach(member => {
      const year = member.angkatan;
      angkatanMap.set(year, (angkatanMap.get(year) || 0) + 1);
    });

    // Convert map to array and sort by year (descending)
    const angkatanData = Array.from(angkatanMap, ([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);

    const totalAnggota = members.length;

    return { angkatanData, totalAnggota };
  };

  const { angkatanData, totalAnggota } = calculateStatistics();
  
  // Prepare data for display (show 5 most recent years by default)
  const displayedAngkatanData = showAllAngkatan 
    ? angkatanData 
    : angkatanData.slice(0, 5);

  const toggleShowAllAngkatan = () => {
    setShowAllAngkatan(!showAllAngkatan);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Content when data is loaded */}
        {!loading && (
          <>
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
                {angkatanData.length > 5 && (
                  <button 
                    onClick={toggleShowAllAngkatan}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {showAllAngkatan ? 'Lihat 5 Angkatan Terbaru' : 'Lihat Semua Angkatan'}
                  </button>
                )}
              </div>
              
              {displayedAngkatanData.length > 0 ? (
                <div className="space-y-4">
                  {displayedAngkatanData.map((item) => (
                    <div key={item.year} className="flex items-center">
                      <div className="w-16 font-medium text-gray-700">Angkatan {item.year}</div>
                      <div className="flex-1 mx-4">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-orange-500 transition-all duration-1000 ease-out ${isAnimated ? '' : 'w-0'}`}
                            style={{ 
                              width: isAnimated ? `${(item.count / totalAnggota) * 100}%` : '0%',
                              transitionDelay: `${item.year % 3 * 200}ms` // Staggered animation
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className={`w-16 text-right font-medium text-gray-700 transition-opacity duration-500 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
                        {item.count} {item.count === 1 ? 'orang' : 'orang'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada data angkatan</p>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BerandaAdmin;