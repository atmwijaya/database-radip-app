import React from 'react';
import { FaArrowRight, FaWhatsapp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const adminPhoneNumber = "6281234567890"; 
    const adminName = "Admin Database"; 

    const handleCekNamaClick = () => {
        navigate('/daftar-anggota');
    };

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(`Halo ${adminName}, saya ingin bertanya tentang database anggota Racana Diponegoro.`);
        window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
    };

    const handleAdminClick = () => {
        const message = encodeURIComponent(`Halo ${adminName}, saya anggota Racana Diponegoro dan ingin mendaftar ke database online.`);
        window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
    };

    return (
        <section className="py-8 sm:py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
                        Database Anggota<br />
                        <span className="text-blue-600">Racana Diponegoro</span>
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-0">
                        Sistem database terpadu untuk pengelolaan data anggota Racana Diponegoro. 
                        Akses informasi anggota dengan mudah dan cepat.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2 sm:px-0">
                        <button  
                            onClick={handleCekNamaClick}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:py-3 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <span>Cek Nama Anggota</span>
                            <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 sm:py-3 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Kontak Admin</span>
                        </button>
                    </div>
                    
                    <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-2 sm:px-0">
                        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm md:shadow-md border border-blue-100 hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
                            <div className="text-blue-600 text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">100%</div>
                            <div className="text-gray-700 font-medium text-sm sm:text-base">Data Terupdate</div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Database diperbarui berkala</p>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm md:shadow-md border border-blue-100 hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
                            <div className="text-blue-600 text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">24/7</div>
                            <div className="text-gray-700 font-medium text-sm sm:text-base">Akses Online</div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Akses kapan saja, di mana saja</p>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm md:shadow-md border border-blue-100 hover:shadow-md md:hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                            <div className="text-blue-600 text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Aman</div>
                            <div className="text-gray-700 font-medium text-sm sm:text-base">Data Terproteksi</div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Keamanan data terjamin</p>
                        </div>
                    </div>

                    {/* CTA Mobile Optimized */}
                    <div className="mt-8 sm:mt-12 md:mt-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white mx-2 sm:mx-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                            Belum Terdaftar di Database?
                        </h3>
                        <p className="text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90">
                            Jika Anda anggota Racana Diponegoro dan belum terdaftar dalam database online,
                            segera hubungi admin untuk verifikasi.
                        </p>
                        <button 
                            onClick={handleAdminClick}
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto text-sm sm:text-base active:scale-95"
                        >
                            <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Hubungi Admin via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;