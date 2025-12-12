import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavbarAdmin from '../components/navbarAdmin';
import Footer from '../../components/footer';
import { checkTokenExpiration } from '../../../../backend/utils/auth';
import { isAuthenticated, logout } from '../../../../backend/utils/auth';

const BerandaAdmin = () => {
  const [showAllAngkatan, setShowAllAngkatan] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [jenjangSortBy, setJenjangSortBy] = useState('tahun');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const animationRef = useRef(null);

  const fetchMembers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/api/db`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data anggota');
    }
    
    return await response.json();
  };

  // Gunakan React Query
  const { 
    data: members = [], 
    isLoading, 
    isError,
    error,
    isSuccess 
  } = useQuery({
    queryKey: ['members', 'dashboard'],
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Trigger animation ketika data berhasil di-load
  useEffect(() => {
    if (isSuccess && members.length > 0) {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      setIsAnimated(false);

      animationRef.current = setTimeout(() => {
        setIsAnimated(true);
      }, 300); 
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isSuccess, members]); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !checkTokenExpiration()) {
      logout();
      return;
    }

    if (!isAuthenticated()) {
      navigate('/enter');
    }

    const tokenCheckInterval = setInterval(() => {
      if (!isAuthenticated()) {
        navigate('/enter');
      }
    }, 60000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    if (!members.length) return {
      angkatanData: [],
      jenjangData: [],
      totalAnggota: 0,
      totalJenjang: { muda: 0, madya: 0, bhakti: 0 }
    };

    const angkatanMap = new Map();
    const jenjangMap = new Map();
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const year = member.angkatan;
      const jenjang = member.jenjang || 'muda';
      
      // Hitung per angkatan
      angkatanMap.set(year, (angkatanMap.get(year) || 0) + 1);
      
      // Hitung per jenjang
      if (!jenjangMap.has(year)) {
        jenjangMap.set(year, {
          muda: 0,
          madya: 0,
          bhakti: 0,
          total: 0
        });
      }
      
      const jenjangData = jenjangMap.get(year);
      jenjangData[jenjang] = (jenjangData[jenjang] || 0) + 1;
      jenjangData.total++;
    }

    // Convert angkatan map to array
    const angkatanData = Array.from(angkatanMap, ([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);

    // Convert jenjang map to array
    const jenjangData = Array.from(jenjangMap, ([year, data]) => ({
      year,
      ...data,
      mudaPercentage: data.total > 0 ? Math.round((data.muda / data.total) * 100) : 0,
      madyaPercentage: data.total > 0 ? Math.round((data.madya / data.total) * 100) : 0,
      bhaktiPercentage: data.total > 0 ? Math.round((data.bhakti / data.total) * 100) : 0
    }));

    // Sort jenjang data
    const sortedJenjangData = jenjangSortBy === 'tahun' 
      ? jenjangData.sort((a, b) => b.year - a.year)
      : jenjangData.sort((a, b) => b.total - a.total);

    const totalAnggota = members.length;

    // Hitung total per jenjang
    const totalJenjang = {
      muda: members.filter(m => (m.jenjang || 'muda') === 'muda').length,
      madya: members.filter(m => m.jenjang === 'madya').length,
      bhakti: members.filter(m => m.jenjang === 'bhakti').length
    };

    return { 
      angkatanData, 
      jenjangData: sortedJenjangData,
      totalAnggota, 
      totalJenjang 
    };
  }, [members, jenjangSortBy]);

  const { angkatanData, jenjangData, totalAnggota, totalJenjang } = statistics;
  
  // Prepare data for display
  const displayedAngkatanData = showAllAngkatan 
    ? angkatanData 
    : angkatanData.slice(0, 5);

  const toggleShowAllAngkatan = () => {
    setShowAllAngkatan(!showAllAngkatan);
  };

  const toggleJenjangSort = () => {
    setJenjangSortBy(jenjangSortBy === 'tahun' ? 'jumlah' : 'tahun');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>
        
        {/* Error Message */}
        {isError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error?.message || 'Gagal mengambil data'}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="space-y-8">
            {/* Skeleton screens... */}
          </div>
        ) : (
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

              {/* Statistik Jenjang Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Penyebaran Jenjang</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Muda */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">Muda</span>
                      <div className={`text-lg font-bold text-green-700 transition-all duration-500 ${isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                        {totalJenjang.muda}
                      </div>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-1000 ease-out"
                        style={{ 
                          width: isAnimated ? `${(totalJenjang.muda / totalAnggota) * 100}%` : '0%',
                          transitionDelay: '100ms'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-green-600 mt-1 text-right">
                      {totalAnggota > 0 ? Math.round((totalJenjang.muda / totalAnggota) * 100) : 0}%
                    </div>
                  </div>
                  
                  {/* Madya */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-800">Madya</span>
                      <div className={`text-lg font-bold text-red-700 transition-all duration-500 ${isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                        {totalJenjang.madya}
                      </div>
                    </div>
                    <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-1000 ease-out"
                        style={{ 
                          width: isAnimated ? `${(totalJenjang.madya / totalAnggota) * 100}%` : '0%',
                          transitionDelay: '200ms'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-red-600 mt-1 text-right">
                      {totalAnggota > 0 ? Math.round((totalJenjang.madya / totalAnggota) * 100) : 0}%
                    </div>
                  </div>
                  
                  {/* Bhakti */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-yellow-800">Bhakti</span>
                      <div className={`text-lg font-bold text-yellow-700 transition-all duration-500 ${isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                        {totalJenjang.bhakti}
                      </div>
                    </div>
                    <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-1000 ease-out"
                        style={{ 
                          width: isAnimated ? `${(totalJenjang.bhakti / totalAnggota) * 100}%` : '0%',
                          transitionDelay: '300ms'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-yellow-600 mt-1 text-right">
                      {totalAnggota > 0 ? Math.round((totalJenjang.bhakti / totalAnggota) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistik per Angkatan - FIX ANIMATION */}
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
                  {displayedAngkatanData.map((item, index) => (
                    <div key={item.year} className="flex items-center">
                      <div className="w-16 font-medium text-gray-700">Angkatan {item.year}</div>
                      <div className="flex-1 mx-4">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-orange-500 transition-all duration-1000 ease-out ${isAnimated ? '' : 'w-0'}`}
                            style={{ 
                              width: isAnimated ? `${(item.count / totalAnggota) * 100}%` : '0%',
                              transitionDelay: `${index * 150}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className={`w-16 text-right font-medium text-gray-700 transition-all duration-500 ${isAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                        {item.count} {item.count === 1 ? 'orang' : 'orang'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada data angkatan</p>
              )}
            </div>

            {/* Statistik Jenjang per Angkatan */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Jenjang per Angkatan</h2>
                <button 
                  onClick={toggleJenjangSort}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={jenjangSortBy === 'tahun' 
                        ? "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" 
                        : "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"} />
                  </svg>
                  Sort by: {jenjangSortBy === 'tahun' ? 'Tahun (Desc)' : 'Jumlah (Desc)'}
                </button>
              </div>
              
              {jenjangData.length > 0 ? (
                <div className="space-y-6">
                  {jenjangData.slice(0, 10).map((item, index) => (
                    <div key={item.year} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-700">Angkatan {item.year}</h3>
                        <span className="text-sm text-gray-500">Total: {item.total} anggota</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Muda */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700 font-medium">Muda</span>
                            <span className="text-gray-600">{item.muda} ({item.mudaPercentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-1000 ease-out"
                              style={{ 
                                width: isAnimated ? `${item.mudaPercentage}%` : '0%',
                                transitionDelay: `${index * 100}ms`
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Madya */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-red-700 font-medium">Madya</span>
                            <span className="text-gray-600">{item.madya} ({item.madyaPercentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-1000 ease-out"
                              style={{ 
                                width: isAnimated ? `${item.madyaPercentage}%` : '0%',
                                transitionDelay: `${index * 100 + 50}ms`
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Bhakti */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-yellow-700 font-medium">Bhakti</span>
                            <span className="text-gray-600">{item.bhakti} ({item.bhaktiPercentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 transition-all duration-1000 ease-out"
                              style={{ 
                                width: isAnimated ? `${item.bhaktiPercentage}%` : '0%',
                                transitionDelay: `${index * 100 + 100}ms`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {jenjangData.length > 10 && (
                    <div className="text-center pt-4">
                      <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Tampilkan {jenjangData.length - 10} angkatan lainnya...
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada data jenjang</p>
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