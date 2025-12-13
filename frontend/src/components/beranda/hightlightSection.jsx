import React from 'react';
import { 
    FaDatabase, FaShieldAlt, FaSearch, 
    FaChartBar, FaSync, FaUserFriends,
    FaWhatsapp
} from "react-icons/fa";

const HighlightSection = () => {
    const adminPhoneNumber = "6281234567890";
    const adminName = "Admin Database";

    const handleAdminClick = () => {
        const message = encodeURIComponent(`Halo ${adminName}, saya anggota Racana Diponegoro dan ingin mendaftar ke database online.`);
        window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
    };

    const highlights = [
        {
            icon: <FaDatabase className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Database Terpusat",
            description: "Semua data anggota tersimpan dalam sistem terpusat yang mudah diakses",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: <FaShieldAlt className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Keamanan Data",
            description: "Sistem keamanan berlapis untuk melindungi informasi pribadi anggota",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: <FaSearch className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Pencarian Cepat",
            description: "Temukan data anggota dengan cepat menggunakan fitur pencarian canggih",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: <FaChartBar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Analisis Statistik",
            description: "Dashboard analisis untuk melihat tren dan perkembangan keanggotaan",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50"
        },
        {
            icon: <FaSync className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Update Real-time",
            description: "Data diperbarui secara real-time oleh tim admin terpercaya",
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            icon: <FaUserFriends className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
            title: "Komunitas Aktif",
            description: "Menghubungkan seluruh anggota dalam satu platform digital",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        }
    ];

    return (
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-b from-white to-blue-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                        Keunggulan Sistem Database
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
                        Sistem database yang dirancang khusus untuk mendukung pengelolaan anggota Racana Diponegoro
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {highlights.map((item, index) => (
                        <div 
                            key={index} 
                            className={`${item.bgColor} p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95`}
                        >
                            <div className={`${item.color} mb-3 sm:mb-4`}>
                                {item.icon}
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Section - Mobile Optimized */}
                <div className="mt-8 sm:mt-10 md:mt-12 text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-white mx-2 sm:mx-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                            Belum masuk Database Anggota secara online?
                        </h3>
                        <p className="text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto opacity-90">
                            Jika Anda anggota Racana Diponegoro dan belum terdaftar dalam database,
                            segera hubungi admin untuk verifikasi dan pendaftaran.
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

export default HighlightSection;