import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../assets/Dewasaku_Putih.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Daftar route yang ada di navbar
  const navItems = [
    { path: '/', name: 'Beranda' },
    { path: '/daftar-anggota', name: 'Cek Nama' },
    { path: '/faq', name: 'FAQ' }
  ];

  return (
    <nav className="bg-blue-900 px-4 sm:px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            className="h-12 sm:h-16 object-contain"
            alt="Logo Racana Diponegoro"
          />
        </div>
        
        {/* Navigation links */}
        <div className="flex space-x-4 sm:space-x-8">
          {navItems.map((item) => (
            <div 
              key={item.path}
              className="relative group text-white font-medium text-sm sm:text-base cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              {item.name}
              {/* Garis bawah akan muncul saat hover ATAU saat di halaman aktif */}
              <span className={`
                absolute left-0 bottom-0 h-0.5 bg-orange-400 
                transition-all duration-300
                ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}
              `}></span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;