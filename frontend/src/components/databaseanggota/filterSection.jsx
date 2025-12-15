import React, { useState } from "react";
import { X, Calendar, Building, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";

const FilterSection = ({
  showFilters,
  selectedAngkatan,
  selectedFakultas,
  selectedJenjang,
  angkatanList,
  fakultasList,
  jenjangOptions,
  onToggleFilter,
  onClearFilters,
  activeFilterCount,
  onCloseFilters
}) => {
  const [expandedFakultas, setExpandedFakultas] = useState(false);

  if (!showFilters) return null;

  return (
    <>
      {/* Filter Panel */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-slideDown">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Filter Pencarian</h3>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center px-3 py-1 hover:bg-red-50 rounded transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-1" />
                Hapus Semua
              </button>
            )}
            <button
              onClick={onCloseFilters}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Angkatan Filter */}
          <div>
            <div className="flex items-center mb-3">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Angkatan</span>
              <span className="ml-2 text-xs text-gray-500">({selectedAngkatan.length})</span>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {angkatanList.map(angkatan => (
                  <button
                    key={angkatan}
                    onClick={() => onToggleFilter('angkatan', angkatan.toString())}
                    className={`px-2 py-1.5 rounded text-xs sm:text-sm transition-all duration-200 flex items-center justify-center ${
                      selectedAngkatan.includes(angkatan.toString())
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {angkatan}
                    {selectedAngkatan.includes(angkatan.toString()) && (
                      <X className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fakultas Filter */}
          <div>
            <div className="flex items-center mb-3">
              <Building className="w-4 h-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Fakultas</span>
              <span className="ml-2 text-xs text-gray-500">({selectedFakultas.length})</span>
            </div>
            <div className={`transition-all duration-300 ${expandedFakultas ? 'max-h-48' : 'max-h-32'} overflow-y-auto pr-2`}>
              <div className="space-y-2">
                {fakultasList.map(fakultas => (
                  <button
                    key={fakultas}
                    onClick={() => onToggleFilter('fakultas', fakultas)}
                    className={`w-full px-3 py-2 rounded text-sm transition-all duration-200 flex items-center justify-between ${
                      selectedFakultas.includes(fakultas)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-left truncate">{fakultas}</span>
                    {selectedFakultas.includes(fakultas) && (
                      <X className="w-3 h-3 ml-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {fakultasList.length > 5 && (
              <button
                onClick={() => setExpandedFakultas(!expandedFakultas)}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-800 mt-2 py-1 flex items-center justify-center transition-colors duration-200"
              >
                {expandedFakultas ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Tampilkan lebih sedikit
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Tampilkan {fakultasList.length - 5} lainnya
                  </>
                )}
              </button>
            )}
          </div>

          {/* Jenjang Filter */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3">
              <GraduationCap className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Jenjang</span>
              <span className="ml-2 text-xs text-gray-500">({selectedJenjang.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {jenjangOptions.map(jenjang => (
                <button
                  key={jenjang.value}
                  onClick={() => onToggleFilter('jenjang', jenjang.value)}
                  className={`px-3 py-2 rounded text-sm transition-all duration-200 flex items-center justify-between ${
                    selectedJenjang.includes(jenjang.value)
                      ? jenjang.color.replace('100', '600').replace('text-', 'bg-') + ' text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      jenjang.value === 'muda' ? 'bg-green-500' :
                      jenjang.value === 'madya' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    {jenjang.label}
                  </div>
                  {selectedJenjang.includes(jenjang.value) && (
                    <X className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors duration-200"
            >
              <X className="w-3 h-3 mr-1" />
              Hapus semua
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAngkatan.map(angkatan => (
              <div key={angkatan} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs sm:text-sm px-3 py-1.5 rounded-full animate-slideIn">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Angkatan {angkatan}</span>
                <button
                  onClick={() => onToggleFilter('angkatan', angkatan)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {selectedFakultas.map(fakultas => (
              <div key={fakultas} className="inline-flex items-center bg-purple-100 text-purple-800 text-xs sm:text-sm px-3 py-1.5 rounded-full animate-slideIn">
                <Building className="w-3 h-3 mr-1" />
                <span className="max-w-[120px] truncate">{fakultas}</span>
                <button
                  onClick={() => onToggleFilter('fakultas', fakultas)}
                  className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {selectedJenjang.map(jenjang => {
              const jenjangOpt = jenjangOptions.find(j => j.value === jenjang);
              return jenjangOpt ? (
                <div key={jenjang} className={`inline-flex items-center ${jenjangOpt.color} text-xs sm:text-sm px-3 py-1.5 rounded-full animate-slideIn`}>
                  <GraduationCap className="w-3 h-3 mr-1" />
                  <span>{jenjangOpt.label}</span>
                  <button
                    onClick={() => onToggleFilter('jenjang', jenjang)}
                    className="ml-2 transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;