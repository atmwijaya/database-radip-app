import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/navbarAdmin";
import Footer from "../../components/footer";
import { checkTokenExpiration } from "../../../../backend/utils/auth";
import * as XLSX from "xlsx";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const fakultasJurusan = {
  Hukum: ["Hukum"],
  "Ekonomika dan Bisnis": [
    "Akuntansi", "Ilmu Ekonomi", "Manajemen", "Ekonomi Islam", "Bisnis Digital"
  ],
  Teknik: [
    "Teknik Sipil", "Arsitektur", "Teknik Kimia", "Teknik Mesin", "Teknik Elektro",
    "Perencanaan Wilayah dan Kota", "Teknik Industri", "Teknik Lingkungan",
    "Teknik Perkapalan", "Teknik Geologi", "Teknik Geodesi", "Teknik Komputer"
  ],
  Kedokteran: [
    "Kedokteran", "Ilmu Gizi", "Keperawatan", "Farmasi", "Kedokteran Gigi"
  ],
  "Peternakan dan Pertanian": [
    "Peternakan", "Agribisnis", "Agroteknologi", "Teknologi Pangan", "Akuakultur"
  ],
  "Ilmu Budaya": [
    "Sastra Inggris", "Sastra Indonesia", "Sejarah", "Ilmu Perpustakaan",
    "Antropologi Sosial", "Bahasa dan Kebudayaan Jepang"
  ],
  "Ilmu Sosial dan Politik": [
    "Administrasi Publik", "Administrasi Bisnis", "Ilmu Pemerintahan",
    "Ilmu Komunikasi", "Hubungan Internasional"
  ],
  "Sains dan Matematika": [
    "Matematika", "Biologi", "Kimia", "Fisika", "Statistika",
    "Bioteknologi", "Informatika"
  ],
  "Kesehatan Masyarakat": [
    "Kesehatan Masyarakat", "Kesehatan dan Keselamatan Kerja"
  ],
  "Perikanan dan Ilmu Kelautan": [
    "Akuakultur", "Ilmu Kelautan", "Manajemen Sumber Daya Perairan",
    "Oseanografi", "Perikanan Tangkap", "Teknologi Hasil Perikanan"
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
    "Informasi dan Hubungan Masyarakat"
  ]
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

// Import function untuk React Query Mutation
const importMembers = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/db/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal mengimport data");
  }

  return response.json();
};

const DatabaseAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "nama",
    direction: "asc",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const navigate = useNavigate();
  
  // Gunakan Query Client untuk invalidate cache
  const queryClient = useQueryClient();

  // Gunakan React Query untuk fetching data
  const { 
    data: members = [], 
    isLoading, 
    isError,
    error: fetchError 
  } = useQuery({
    queryKey: ['members', 'admin'], // Key unik untuk cache admin
    queryFn: fetchMembersAdmin,
    staleTime: 5 * 60 * 1000, // Data dianggap segar selama 5 menit
    cacheTime: 10 * 60 * 1000, // Cache disimpan selama 10 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Mutation untuk delete member
  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      // Invalidate dan refetch query members
      queryClient.invalidateQueries(['members', 'admin']);
      setShowDeleteModal(false);
      setDataToDelete(null);
      setSuccessMessage("Data berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  });

  // Mutation untuk import members
  const importMutation = useMutation({
    mutationFn: importMembers,
    onSuccess: (result) => {
      // Invalidate dan refetch query members
      queryClient.invalidateQueries(['members', 'admin']);
      
      // Handle error dari backend
      if (result.details?.errors?.length > 0) {
        const backendErrors = result.details.errors.map((err, index) => ({
          row: index + 1,
          error: err.error || "Error tidak diketahui",
          data: err
        }));
        setImportErrors(backendErrors);
        
        if (result.details.success > 0) {
          setSuccessMessage(
            `Berhasil mengimport ${result.details.success} data, tetapi ${result.details.errors.length} data gagal.`
          );
        }
      } else {
        let successCount = result.details?.success || result.inserted || result.success || importData.length;
        let duplicateCount = result.details?.duplicates || result.duplicates || 0;

        if (duplicateCount > 0) {
          setSuccessMessage(
            `Berhasil mengimport ${successCount} data! ⚠️ ${duplicateCount} data duplikat tidak diimport.`
          );
        } else {
          setSuccessMessage(`✅ Berhasil mengimport ${successCount} data!`);
        }

        // Reset modal jika tidak ada error
        if (result.details?.errors?.length === 0) {
          setShowImportModal(false);
          setImportData([]);
          setImportErrors([]);
        }
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    },
    onError: (error) => {
      setError(error.message || "Terjadi kesalahan saat mengimport data");
      setTimeout(() => setError(null), 5000);
    }
  });

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

    // Set up token expiration check every minute
    const interval = setInterval(() => {
      if (!checkTokenExpiration()) {
        handleLogout();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorted data
  const sortedData = React.useMemo(() => {
    let sortableData = [...members];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [members, sortConfig]);

  // Filter data berdasarkan search term
  const filteredData = sortedData.filter((item) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ) || [];

  // Handle delete confirmation
  const confirmDelete = (item) => {
    setDataToDelete(item);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = () => {
    if (dataToDelete) {
      deleteMutation.mutate(dataToDelete._id);
    }
  };

  // Fungsi untuk menangani upload file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          cellText: false,
          cellNF: true,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: "",
        });

        // Validasi dan format data
        const { validData, errors } = validateImportData(jsonData);
        setImportData(validData);
        setImportErrors(errors);
      } catch (err) {
        setError("Gagal membaca file: " + err.message);
        setTimeout(() => setError(null), 3000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Fungsi untuk memvalidasi data import
  const validateImportData = (data) => {
    const validData = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowErrors = [];

      // Validasi NIM
      let nimValue = row.nim || row.NIM || row.Nim;

      if (!nimValue) {
        rowErrors.push(`NIM harus diisi`);
      } else {
        const nimStr = nimValue.toString().replace(/\D/g, "");

        if (nimStr.length !== 13 && nimStr.length !== 14) {
          rowErrors.push(
            `NIM harus 13 atau 14 digit angka. Diterima: ${nimStr} (${nimStr.length} digit)`
          );
        } else if (!/^\d+$/.test(nimStr)) {
          rowErrors.push(`NIM harus berupa angka`);
        } else {
          row.nim = nimStr;
        }
      }

      // Validasi Nama
      if (!row.nama || typeof row.nama !== "string") {
        rowErrors.push(`Nama harus diisi`);
      }

      // Validasi Fakultas
      if (
        !row.fakultas ||
        !Object.keys(fakultasJurusan).includes(row.fakultas)
      ) {
        rowErrors.push(`Fakultas tidak valid`);
      }

      // Validasi Jurusan
      if (row.fakultas && row.jurusan) {
        const validJurusan = fakultasJurusan[row.fakultas] || [];
        if (!validJurusan.includes(row.jurusan)) {
          rowErrors.push(`Jurusan tidak valid untuk fakultas ${row.fakultas}`);
        }
      }

      // Validasi Angkatan
      if (!row.angkatan || !/^\d{4}$/.test(row.angkatan.toString())) {
        rowErrors.push(`Angkatan harus 4 digit angka`);
      }

      // Validasi Tempat Lahir
      if (!row.tempatLahir) {
        rowErrors.push(`Tempat lahir harus diisi`);
      }

      // Validasi Tanggal Lahir
      if (!row.tanggalLahir) {
        rowErrors.push(`Tanggal lahir harus diisi`);
      } else if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(row.tanggalLahir)) {
        rowErrors.push(`Format tanggal lahir harus DD/MM/YYYY`);
      }

      if (rowErrors.length === 0) {
        const [day, month, year] = row.tanggalLahir.split("/");
        const formattedDate = `${day} ${
          monthNames[parseInt(month) - 1]
        } ${year}`;
        const ttl = `${row.tempatLahir}, ${formattedDate}`;

        validData.push({
          nama: row.nama,
          noInduk: row.noInduk || "-",
          nim: row.nim,
          fakultas: row.fakultas,
          jurusan: row.jurusan,
          angkatan: parseInt(row.angkatan),
          ttl: ttl,
          pandega: row.pandega || "-",
          tanggalLahir: row.tanggalLahir,
        });
      } else {
        errors.push({
          row: index + 2,
          errors: rowErrors,
          data: row,
        });
      }
    });

    return { validData, errors };
  };

  const checkForDuplicates = (data) => {
    const duplicates = [];
    const nimSet = new Set();

    data.forEach((item, index) => {
      if (nimSet.has(item.nim)) {
        duplicates.push({
          row: index + 1,
          nim: item.nim,
          nama: item.nama,
        });
      } else {
        nimSet.add(item.nim);
      }
    });

    return duplicates;
  };

  // Fungsi untuk mengirim data import ke backend
  const handleImportSubmit = async () => {
    if (importData.length === 0) return;
    
    // Hapus data duplikat sebelum mengirim
    const uniqueData = [];
    const nimSet = new Set();

    importData.forEach((item) => {
      if (!nimSet.has(item.nim)) {
        nimSet.add(item.nim);
        uniqueData.push(item);
      }
    });

    const dataToSend = uniqueData;
    importMutation.mutate(dataToSend);
  };

  // Fungsi untuk download template
  const downloadTemplate = () => {
    const templateData = [
      {
        nama: "John Doe",
        noInduk: "-",
        nim: "'12345678901234",
        fakultas: "Ekonomika dan Bisnis",
        jurusan: "Manajemen",
        angkatan: "2020",
        tempatLahir: "Jakarta",
        tanggalLahir: "'15/01/2002",
        pandega: "-",
      },
      {
        nama: "Jane Smith",
        noInduk: "-",
        nim: "'12345678901235",
        fakultas: "Teknik",
        jurusan: "Teknik Sipil",
        angkatan: "2021",
        tempatLahir: "Surabaya",
        tanggalLahir: "'20/05/2001",
        pandega: "-",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const instructions = [
      ["INSTRUKSI PENGISIAN:"],
      ["1. Gunakan format TANGGAL: DD/MM/YYYY (contoh: 17/04/2004)"],
      ["2. Format NIM: 13 atau 14 digit angka (tanpa huruf atau simbol)"],
      ["3. Set format kolom sebagai 'Text' sebelum input data"],
      ["4. Untuk tanggal, gunakan format DD/MM/YYYY, bukan MM/DD/YYYY"],
      [""],
      ["DATA CONTOH:"],
    ];

    XLSX.utils.sheet_add_aoa(worksheet, instructions, { origin: "A10" });

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      if (R === 0) continue;

      const nimCell = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (worksheet[nimCell]) {
        worksheet[nimCell].t = "s";
        worksheet[nimCell].z = "@";
      }

      const dateCell = XLSX.utils.encode_cell({ r: R, c: 7 });
      if (worksheet[dateCell]) {
        worksheet[dateCell].t = "s";
        worksheet[dateCell].z = "@";
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_import_anggota.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />

      <main className="flex-grow flex flex-col mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Database Anggota
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => requestSort("angkatan")}
              className={`px-3 py-2 rounded-md text-sm ${
                sortConfig.key === "angkatan"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Sort by Angkatan{" "}
              {sortConfig.key === "angkatan" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => requestSort("fakultas")}
              className={`px-3 py-2 rounded-md text-sm ${
                sortConfig.key === "fakultas"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Sort by Fakultas{" "}
              {sortConfig.key === "fakultas" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => setSortConfig({ key: "nama", direction: "asc" })}
              className="px-3 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Reset Sort
            </button>
            <Link
              to="/admin/create-anggota"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Data
            </Link>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Data
            </button>
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
              placeholder="Cari anggota..."
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
            {fetchError?.message || 'Gagal mengambil data'}
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                Import Data dari File
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (CSV atau Excel)
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format file harus sesuai dengan template.
                  <button
                    onClick={downloadTemplate}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Download template
                  </button>
                </p>
              </div>

              {importErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <h3 className="font-semibold mb-2">
                    {importErrors.some(e => e.errors) ? 'Error pada baris:' : 'Error dari Server:'}
                  </h3>
                  {importErrors.slice(0, 5).map((error, index) => {
                    const isValidationError = error.errors && Array.isArray(error.errors);
                    const isBackendError = error.error;

                    return (
                      <div key={index} className="mb-2">
                        {isValidationError ? (
                          <>
                            <p className="font-medium">Baris {error.row || 'Tidak diketahui'}:</p>
                            <ul className="list-disc list-inside ml-4">
                              {error.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                            {error.data && (
                              <details className="ml-4 mt-1 text-sm">
                                <summary>Data baris:</summary>
                                <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto">
                                  {JSON.stringify(error.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Error Server:</p>
                            <ul className="list-disc list-inside ml-4">
                              <li>
                                <strong>Error:</strong> {error.error || 'Error tidak diketahui'}
                              </li>
                              {error.data && (
                                <>
                                  <li><strong>Nama:</strong> {error.data.nama}</li>
                                  <li><strong>NIM:</strong> {error.data.nim}</li>
                                </>
                              )}
                            </ul>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {importErrors.length > 5 && (
                    <p className="mt-2">
                      ... dan {importErrors.length - 5} error lainnya
                    </p>
                  )}
                  <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>⚠️ Perhatian:</strong> Silahkan ganti data yang sudah terdaftar atau hapus dari daftar sebelum mengimport ulang.
                    </p>
                  </div>
                </div>
              )}

              {importData.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-green-600">
                    {importData.length} data valid siap diimport
                  </p>

                  {(() => {
                    const duplicates = checkForDuplicates(importData);
                    if (duplicates.length > 0) {
                      return (
                        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                          <h3 className="font-semibold mb-2">
                            ⚠️ Peringatan: Data Duplikat
                          </h3>
                          <p className="mb-2">
                            Ditemukan {duplicates.length} data dengan NIM yang
                            sama:
                          </p>
                          <ul className="list-disc list-inside ml-4">
                            {duplicates.slice(0, 5).map((dup, index) => (
                              <li key={index}>
                                Baris {dup.row}: {dup.nama} (NIM: {dup.nim})
                              </li>
                            ))}
                          </ul>
                          {duplicates.length > 5 && (
                            <p className="mt-2">
                              ... dan {duplicates.length - 5} duplikat lainnya
                            </p>
                          )}
                          <p className="mt-2 font-semibold">
                            Data duplikat tidak akan diimport.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Nama
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            NIM
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Fakultas
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Jurusan
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Angkatan
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            TTL
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Pandega
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importData.slice(0, 10).map((item, index) => {
                          const isDuplicate = checkForDuplicates(
                            importData
                          ).some(
                            (dup) =>
                              dup.nim === item.nim && dup.row !== index + 1
                          );

                          return (
                            <tr
                              key={index}
                              className={
                                isDuplicate
                                  ? "bg-yellow-50"
                                  : index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50"
                              }
                            >
                              <td className="px-3 py-2 text-sm">{item.nama}</td>
                              <td className="px-3 py-2 text-sm">{item.nim}</td>
                              <td className="px-3 py-2 text-sm">
                                {item.fakultas}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {item.jurusan}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {item.angkatan}
                              </td>
                              <td className="px-3 py-2 text-sm">{item.ttl}</td>
                              <td className="px-3 py-2 text-sm">
                                {item.pandega}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {isDuplicate ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⚠️ Duplikat
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Valid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {importData.length > 10 && (
                      <p className="mt-2 text-sm text-gray-500">
                        ... dan {importData.length - 10} data lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData([]);
                    setImportErrors([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>

                {checkForDuplicates(importData).length > 0 && (
                  <button
                    onClick={() => {
                      const uniqueData = [];
                      const nimSet = new Set();

                      importData.forEach((item) => {
                        if (!nimSet.has(item.nim)) {
                          nimSet.add(item.nim);
                          uniqueData.push(item);
                        }
                      });

                      setImportData(uniqueData);
                      setSuccessMessage(
                        `Data duplikat telah dihapus. Tinggal ${uniqueData.length} data unik.`
                      );
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Hapus Duplikat
                  </button>
                )}
                
                <button
                  onClick={handleImportSubmit}
                  disabled={importData.length === 0 || importMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {importMutation.isLoading ? (
                    <span className="flex">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
                  ) : (
                    `Import (${importData.length})`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
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
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center min-w-[80px]"
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? (
                    <span className="flex">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.nama}
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
                        {isLoading ? "Memuat data..." : "Tidak ada data yang ditemukan"}
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
                    <h3 className="font-medium text-gray-900">{item.nama}</h3>
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
              {isLoading ? "Memuat data..." : "Tidak ada data yang ditemukan"}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
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
      </main>

      <Footer />
    </div>
  );
};

export default DatabaseAdmin;