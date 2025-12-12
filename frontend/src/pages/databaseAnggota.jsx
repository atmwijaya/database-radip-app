import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Search } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchMembers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/db`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data anggota");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

const DatabaseAnggota = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Gunakan React Query untuk fetching data
  const {
    data: members = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["members", "public"], // Key unik untuk cache
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000, // Data dianggap segar selama 5 menit
    cacheTime: 10 * 60 * 1000, // Cache disimpan selama 10 menit
    refetchOnWindowFocus: false, // Tidak refetch saat window focus
    refetchOnMount: false, // Tidak refetch saat komponen mount ulang
    retry: 1, // Coba ulang 1 kali jika gagal
  });

  // Handle search button click
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const filtered = members.filter(
      (member) =>
        member.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.noInduk &&
          member.noInduk.toLowerCase().includes(searchQuery.toLowerCase())) ||
        member.nim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.fakultas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.jurusan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.angkatan?.toString().includes(searchQuery) ||
        member.ttl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.pandega &&
          member.pandega.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredMembers(filtered);
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-4 sm:mb-6">
              Cari anggota
            </h1>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Masukkan nama, NIM, nomor induk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Loading and error states */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error?.message || "Gagal mengambil data anggota"}
            </div>
          )}

          {/* Results section */}
          {hasSearched && !isLoading && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {filteredMembers.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Nama Lengkap
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            No. Induk
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            NIM
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Fakultas/Jurusan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Angkatan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Jenjang
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Tanggal Dilantik
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                            Pandega
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                          <tr
                            key={member._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {member.nama}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.noInduk}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.nim}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.fakultas}/{member.jurusan}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.angkatan}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {member.tanggalDilantik
                                ? new Date(
                                    member.tanggalDilantik
                                  ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.pandega}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <div
                        key={member._id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {member.nama}
                            </h3>
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
                                Angkatan: {member.angkatan}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded ml-auto">
                            <div className="flex items-center justify-end">
                              <svg
                                className="w-3 h-3 mr-1 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="font-medium">Dilantik:</span>
                              <span className="ml-1">
                                {member.tanggalDilantik
                                  ? new Date(
                                      member.tanggalDilantik
                                    ).toLocaleDateString("id-ID")
                                  : "Belum ditentukan"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                            <div>
                              <span className="font-medium">No. Induk:</span>{" "}
                              {member.noInduk}
                            </div>
                            <div>
                              <span className="font-medium">NIM:</span>{" "}
                              {member.nim}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-medium">
                                Fakultas/Jurusan:
                              </span>{" "}
                              {member.fakultas}/{member.jurusan}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-medium">Pandega:</span>{" "}
                              {member.pandega}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                    Tidak ada data yang ditemukan
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Coba gunakan kata kunci yang berbeda atau periksa ejaan
                    Anda.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Initial state - before search */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Mulai pencarian anggota
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm sm:max-w-md mx-auto px-4">
                Ketikkan nama, NIM, nomor induk, atau informasi lainnya pada
                kolom pencarian di atas dan klik tombol "Cari" untuk menemukan
                data anggota.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DatabaseAnggota;
