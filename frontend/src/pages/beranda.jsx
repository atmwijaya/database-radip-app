import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { FaArrowRight } from "react-icons/fa";  // Fixed import
import { useNavigate } from 'react-router-dom';

const Beranda = () => {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate('/daftar-anggota');
    };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 sm:mb-8 leading-tight">
            Database Anggota<br />
            Racana Diponegoro
          </h1>
          
          <button  
          onClick={handleButtonClick}
          className ="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto text-sm sm:text-base">
    
            <span>Cek nama disini</span>
            <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />  {/* Fixed usage */}
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Beranda;