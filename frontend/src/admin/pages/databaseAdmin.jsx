import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/navbarAdmin";
import Footer from "../../components/footer";
import { checkTokenExpiration } from "../../../../backend/utils/auth";
import ImportAnggotaModal from "./importAnggotaModal";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const fakultasJurusan = {
  Hukum: ["Hukum"],
  "Ekonomika dan Bisnis": [
    "Akuntansi",
    "Ilmu Ekonomi",
    "Manajemen",
    "Ekonomi Islam",
    "Bisnis Digital",
  ],
  Teknik: [
    "Teknik Sipil",
    "Arsitektur",
    "Teknik Kimia",
    "Teknik Mesin",
    "Teknik Elektro",
    "Perencanaan Wilayah dan Kota",
    "Teknik Industri",
    "Teknik Lingkungan",
    "Teknik Perkapalan",
    "Teknik Geologi",
    "Teknik Geodesi",
    "Teknik Komputer",
  ],
  Kedokteran: [
    "Kedokteran",
    "Ilmu Gizi",
    "Keperawatan",
    "Farmasi",
    "Kedokteran Gigi",
  ],
  "Peternakan dan Pertanian": [
    "Peternakan",
    "Agribisnis",
    "Agroteknologi",
    "Teknologi Pangan",
    "Akuakultur",
  ],
  "Ilmu Budaya": [
    "Sastra Inggris",
    "Sastra Indonesia",
    "Sejarah",
    "Ilmu Perpustakaan",
    "Antropologi Sosial",
    "Bahasa dan Kebudayaan Jepang",
  ],
  "Ilmu Sosial dan Politik": [
    "Administrasi Publik",
    "Administrasi Bisnis",
    "Ilmu Pemerintahan",
    "Ilmu Komunikasi",
    "Hubungan Internasional",
  ],
  "Sains dan Matematika": [
    "Matematika",
    "Biologi",
    "Kimia",
    "Fisika",
    "Statistika",
    "Bioteknologi",
    "Informatika",
  ],
  "Kesehatan Masyarakat": [
    "Kesehatan Masyarakat",
    "Kesehatan dan Keselamatan Kerja",
  ],
  "Perikanan dan Ilmu Kelautan": [
    "Akuakultur",
    "Ilmu Kelautan",
    "Manajemen Sumber Daya Perairan",
    "Oseanografi",
    "Perikanan Tangkap",
    "Teknologi Hasil Perikanan",
  ],
  Psikologi: ["Psikologi"],
  Vokasi: [
    "Teknik Infrastruktur Sipil dan Perancangan Arsitektur",
    "Perencanaan Tata Ruang dan Pertanahan",
    "Teknologi Rekayasa Kimia Industri",
    "Teknologi Rekayasa Otomasi",
    "Teknologi Rekayasa Konstruksi Perkapalan",
    "Teknik Listrik Industri",
    "Akuntansi Perpajakan",
    "Manajemen dan Administrasi Logistik",
    "Bahasa Terapan Asing",
    "Informasi dan Hubungan Masyarakat",
  ],
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch function untuk React Query
const fetchMembersAdmin = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/db`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

// Delete function untuk React Query Mutation
const deleteMember = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/db/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal menghapus data");
  }

  return response.json();
};

const DatabaseAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState(null);
  const [selectedJenjang, setSelectedJenjang] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: members = [],
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["members", "admin"],
    queryFn: fetchMembersAdmin,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Mutation untuk delete member
  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["members", "admin"]);
      setShowDeleteModal(false);
      setDataToDelete(null);
      setSuccessMessage("Data berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const { uniqueAngkatan, uniqueJenjang } = useMemo(() => {
    if (!members || members.length === 0) {
      return { uniqueAngkatan: [], uniqueJenjang: [] };
    }

    const angkatanSet = new Set();
    members.forEach((member) => {
      if (member.angkatan) {
        angkatanSet.add(member.angkatan.toString());
      }
    });
    const uniqueAngkatan = Array.from(angkatanSet)
      .sort((a, b) => parseInt(b) - parseInt(a)) 
      .map((angkatan) => ({
        value: angkatan,
        label: `Angkatan ${angkatan}`,
        count: members.filter((m) => m.angkatan?.toString() === angkatan).length,
      }));
    const jenjangSet = new Set();
    members.forEach((member) => {
      if (member.jenjang) {
        jenjangSet.add(member.jenjang);
      }
    });
    const uniqueJenjang = Array.from(jenjangSet)
      .sort()
      .map((jenjang) => ({
        value: jenjang,
        label: jenjang === "muda" ? "Muda" : jenjang === "madya" ? "Madya" : "Bhakti",
        count: members.filter((m) => m.jenjang === jenjang).length,
      }));

    return { uniqueAngkatan, uniqueJenjang };
  }, [members]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("tokenExpiration");
    navigate("/enter");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !checkTokenExpiration()) {
      handleLogout();
    }

    const interval = setInterval(() => {
      if (!checkTokenExpiration()) {
        handleLogout();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...members];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return (
          item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.noInduk &&
            item.noInduk.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.fakultas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.angkatan?.toString().includes(searchTerm) ||
          item.ttl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.pandega &&
            item.pandega.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (selectedAngkatan) {
      filtered = filtered.filter(
        (item) => item.angkatan?.toString() === selectedAngkatan
      );
    }

    if (selectedJenjang) {
      filtered = filtered.filter((item) => item.jenjang === selectedJenjang);
    }

    filtered.sort((a, b) => {
      const nameA = a.nama?.toLowerCase() || '';
      const nameB = b.nama?.toLowerCase() || '';
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    return filtered;
  }, [members, searchTerm, selectedAngkatan, selectedJenjang]);

  const resetAllFilters = () => {
    setSelectedAngkatan(null);
    setSelectedJenjang(null);
    setShowSortDropdown(false);
  };

  const clearAngkatanFilter = () => {
    setSelectedAngkatan(null);
  };

  const clearJenjangFilter = () => {
    setSelectedJenjang(null);
  };

  const getFilterDisplayText = () => {
    if (selectedAngkatan && selectedJenjang) {
      return `Angkatan ${selectedAngkatan} & ${selectedJenjang === "muda" ? "Muda" : selectedJenjang === "madya" ? "Madya" : "Bhakti"}`;
    }
    if (selectedAngkatan) {
      return `Angkatan ${selectedAngkatan}`;
    }
    if (selectedJenjang) {
      return selectedJenjang === "muda" ? "Muda" : selectedJenjang === "madya" ? "Madya" : "Bhakti";
    }
    return "Filter";
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData =
    filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize) ||
    [];

  const confirmDelete = (item) => {
    setDataToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (dataToDelete) {
      deleteMutation.mutate(dataToDelete._id);
    }
  };

  const handleImportSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleImportError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />

      <main className="flex-grow flex flex-col mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Database Anggota</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total {filteredData.length} anggota ditemukan
              {selectedAngkatan && ` • Angkatan ${selectedAngkatan}`}
              {selectedJenjang && ` • Jenjang ${selectedJenjang === "muda" ? "Muda" : selectedJenjang === "madya" ? "Madya" : "Bhakti"}`}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Desktop Sort/Filter - Visible on md and above */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Angkatan Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(showSortDropdown === "angkatan" ? null : "angkatan")}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                    selectedAngkatan
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{selectedAngkatan ? `Angkatan ${selectedAngkatan}` : "Filter Angkatan"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showSortDropdown === "angkatan" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showSortDropdown === "angkatan" && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-80 overflow-y-auto">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Pilih Angkatan ({uniqueAngkatan.length})
                      </div>
                      {uniqueAngkatan.map((angkatan) => (
                        <button
                          key={angkatan.value}
                          onClick={() => {
                            setSelectedAngkatan(angkatan.value);
                            setShowSortDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 ${
                            selectedAngkatan === angkatan.value
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{angkatan.label}</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {angkatan.count}
                          </span>
                        </button>
                      ))}
                      {selectedAngkatan && (
                        <button
                          onClick={clearAngkatanFilter}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                        >
                          Hapus Filter Angkatan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Jenjang Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(showSortDropdown === "jenjang" ? null : "jenjang")}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                    selectedJenjang
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>
                    {selectedJenjang
                      ? selectedJenjang === "muda"
                        ? "Muda"
                        : selectedJenjang === "madya"
                        ? "Madya"
                        : "Bhakti"
                      : "Filter Jenjang"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showSortDropdown === "jenjang" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showSortDropdown === "jenjang" && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Pilih Jenjang ({uniqueJenjang.length})
                      </div>
                      {uniqueJenjang.map((jenjang) => (
                        <button
                          key={jenjang.value}
                          onClick={() => {
                            setSelectedJenjang(jenjang.value);
                            setShowSortDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 ${
                            selectedJenjang === jenjang.value
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{jenjang.label}</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {jenjang.count}
                          </span>
                        </button>
                      ))}
                      {selectedJenjang && (
                        <button
                          onClick={clearJenjangFilter}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                        >
                          Hapus Filter Jenjang
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset All Filters Button */}
              {(selectedAngkatan || selectedJenjang) && (
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                >
                  Reset Filter
                </button>
              )}

              {/* Add Data Button */}
              <Link
                to="/admin/create-anggota"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Data
              </Link>

              {/* Import Data Button */}
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import Data
              </button>
            </div>

            {/* Mobile Controls - Visible on md and below */}
            <div className="md:hidden w-full flex flex-col space-y-3">
              <div className="flex space-x-2">
                {/* Add Data Button */}
                <Link
                  to="/admin/create-anggota"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center justify-center text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah
                </Link>

                {/* Import Data Button */}
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md inline-flex items-center justify-center text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import
                </button>

                {/* Filter Dropdown Button for Mobile */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(showSortDropdown === "mobile" ? null : "mobile")}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center"
                  >
                    <span>Filter: {getFilterDisplayText()}</span>
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Filter Dropdown Menu for Mobile */}
                  {showSortDropdown === "mobile" && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 max-h-96 overflow-y-auto">
                      <div className="py-2">
                        {/* Angkatan Section */}
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Filter Angkatan ({uniqueAngkatan.length})
                        </div>
                        {uniqueAngkatan.map((angkatan) => (
                          <button
                            key={angkatan.value}
                            onClick={() => {
                              setSelectedAngkatan(
                                selectedAngkatan === angkatan.value ? null : angkatan.value
                              );
                            }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${
                              selectedAngkatan === angkatan.value
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium">{angkatan.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {angkatan.count}
                              </span>
                              {selectedAngkatan === angkatan.value && (
                                <span className="text-blue-600">✓</span>
                              )}
                            </div>
                          </button>
                        ))}

                        {/* Jenjang Section */}
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b mt-2">
                          Filter Jenjang ({uniqueJenjang.length})
                        </div>
                        {uniqueJenjang.map((jenjang) => (
                          <button
                            key={jenjang.value}
                            onClick={() => {
                              setSelectedJenjang(
                                selectedJenjang === jenjang.value ? null : jenjang.value
                              );
                            }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${
                              selectedJenjang === jenjang.value
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium">{jenjang.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {jenjang.count}
                              </span>
                              {selectedJenjang === jenjang.value && (
                                <span className="text-blue-600">✓</span>
                              )}
                            </div>
                          </button>
                        ))}

                        {/* Reset Section */}
                        {(selectedAngkatan || selectedJenjang) && (
                          <>
                            <div className="border-t border-gray-100 mt-2"></div>
                            <button
                              onClick={resetAllFilters}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Reset Semua Filter
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display for Mobile */}
              {(selectedAngkatan || selectedJenjang) && (
                <div className="flex flex-wrap gap-2">
                  {selectedAngkatan && (
                    <div className="inline-flex items-center bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                      <span>Angkatan {selectedAngkatan}</span>
                      <button
                        onClick={clearAngkatanFilter}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedJenjang && (
                    <div className="inline-flex items-center bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full">
                      <span>
                        {selectedJenjang === "muda"
                          ? "Muda"
                          : selectedJenjang === "madya"
                          ? "Madya"
                          : "Bhakti"}
                      </span>
                      <button
                        onClick={clearJenjangFilter}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {(selectedAngkatan || selectedJenjang) && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama, NIM, fakultas, dll..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Fetch Error */}
        {isError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {fetchError?.message || "Gagal mengambil data"}
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportAnggotaModal
            onClose={() => setShowImportModal(false)}
            onSuccess={handleImportSuccess}
            onError={handleImportError}
            queryClient={queryClient}
            monthNames={monthNames}
            fakultasJurusan={fakultasJurusan}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-bounce-in bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">
                Konfirmasi Hapus Data
              </h3>
              <p className="mb-6">
                Apakah Anda yakin ingin menghapus data {dataToDelete?.nama}?
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center min-w-[80px]"
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table - Desktop */}
        <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="relative max-h-[calc(100vh-300px)] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Induk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fakultas/Jurusan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Tanggal Lahir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Pandega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData && paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {item.nama}
                            </span>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  item.jenjang === "muda"
                                    ? "bg-green-100 text-green-800"
                                    : item.jenjang === "madya"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.jenjang === "muda"
                                  ? "Muda"
                                  : item.jenjang === "madya"
                                  ? "Madya"
                                  : "Bhakti"}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                Dilantik:{" "}
                                {new Date(
                                  item.tanggalDilantik
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.noInduk}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.nim}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.fakultas}/{item.jurusan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.angkatan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.ttl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pandega}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/admin/edit-anggota/${item._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => confirmDelete(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        {isLoading
                          ? "Memuat data..."
                          : "Tidak ada data yang ditemukan dengan filter yang dipilih"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Data Table - Mobile */}
        <div className="md:hidden space-y-4">
          {paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{item.nama}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.jenjang === "muda"
                            ? "bg-green-100 text-green-800"
                            : item.jenjang === "madya"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.jenjang === "muda"
                          ? "M"
                          : item.jenjang === "madya"
                          ? "M"
                          : "B"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Dilantik:</span>{" "}
                      {item.tanggalDilantik
                        ? new Date(item.tanggalDilantik).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.noInduk && `No. Induk: ${item.noInduk} • `}
                      NIM: {item.nim}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.fakultas}/{item.jurusan} • Angkatan: {item.angkatan}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{item.ttl}</p>
                    {item.pandega && (
                      <p className="text-sm text-gray-500 mt-1">
                        Pandega: {item.pandega}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/admin/edit-anggota/${item._id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? "Memuat data..." : "Tidak ada data yang ditemukan dengan filter yang dipilih"}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm text-gray-700">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md p-1 text-sm"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">data per halaman</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DatabaseAdmin;