// sections/EmptyStateSection.jsx
import React from "react";
import { Search } from "lucide-react";

const EmptyStateSection = ({ searchQuery, activeFilterCount }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center py-12 animate-fadeIn">
        <div className="text-gray-200 mb-4">
          <Search className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
          Temukan Anggota dengan Mudah
        </h3>
        <p className="text-gray-500 max-w-lg mx-auto mb-8 px-4">
          Gunakan kolom pencarian di atas untuk menemukan anggota berdasarkan nama, NIM, angkatan, atau informasi lainnya.
        </p>
        
        {/* Tips Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-blue-500 mb-2">
              <Search className="w-6 h-6 mx-auto" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Pencarian Cerdas</h4>
            <p className="text-xs text-gray-500">
              Ketik minimal 2 karakter untuk melihat saran pencarian otomatis.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-purple-500 mb-2">
              <span className="text-lg">🔍</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Filter Fleksibel</h4>
            <p className="text-xs text-gray-500">
              Gunakan filter angkatan, fakultas, dan jenjang untuk mempersempit hasil.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-green-500 mb-2">
              <span className="text-lg">⚡</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Hasil Instan</h4>
            <p className="text-xs text-gray-500">
              Klik saran atau tekan Enter untuk melihat hasil pencarian dengan cepat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateSection;