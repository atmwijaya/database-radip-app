import React from "react";
import { Search, X, Calendar } from "lucide-react";

const ResultsSection = ({
  filteredMembers,
  searchQuery,
  activeFilterCount,
  onClearSearch,
  onClearFilters,
  isSearching
}) => {
  return (
    <div className="animate-fadeIn">
      {/* Results Header */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              Hasil Pencarian
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{filteredMembers.length}</span> anggota ditemukan
              {searchQuery && (
                <span className="text-gray-500"> untuk "<span className="font-medium">{searchQuery}</span>"</span>
              )}
              {activeFilterCount > 0 && (
                <span className="text-gray-500"> dengan {activeFilterCount} filter</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <X className="w-3 h-3 mr-1" />
                Hapus Pencarian
              </button>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center"
              >
                <X className="w-3 h-3 mr-1" />
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Content */}
      {filteredMembers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      No. Induk / NIM
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fakultas / Jurusan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Jenjang
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tanggal Dilantik
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{member.nama}</div>
                          {member.pandega && (
                            <div className="text-xs text-gray-500 mt-1">
                              Pandega: {member.pandega}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>{member.noInduk || "-"}</div>
                          <div className="text-gray-500">{member.nim || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>{member.fakultas || "-"}</div>
                          <div className="text-gray-500">{member.jurusan || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.angkatan || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                            member.jenjang === "muda"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : member.jenjang === "madya"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          {member.jenjang === "muda"
                            ? "Muda"
                            : member.jenjang === "madya"
                            ? "Madya"
                            : "Bhakti"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {member.tanggalDilantik
                          ? new Date(member.tanggalDilantik).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{member.nama}</h4>
                      <div className="flex items-center mt-1 space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            member.jenjang === "muda"
                              ? "bg-green-100 text-green-800"
                              : member.jenjang === "madya"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {member.jenjang === "muda"
                            ? "Muda"
                            : member.jenjang === "madya"
                            ? "Madya"
                            : "Bhakti"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Angkatan: {member.angkatan || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dilantik Info */}
                  {member.tanggalDilantik && (
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="font-medium">Dilantik: </span>
                      <span className="ml-1">
                        {new Date(member.tanggalDilantik).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">No. Induk</div>
                      <div className="font-medium">{member.noInduk || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">NIM</div>
                      <div className="font-medium">{member.nim || "-"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Fakultas / Jurusan</div>
                      <div className="font-medium">
                        {member.fakultas || "-"} {member.jurusan && `/ ${member.jurusan}`}
                      </div>
                    </div>
                    {member.pandega && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Pandega</div>
                        <div className="font-medium">{member.pandega}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-300 mb-3">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada hasil yang ditemukan
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery 
              ? `Tidak ada anggota yang cocok dengan "${searchQuery}"${
                  activeFilterCount > 0 ? " dan filter yang dipilih" : ""
                }`
              : "Silakan coba dengan kata kunci atau filter yang berbeda"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Hapus Pencarian
              </button>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;