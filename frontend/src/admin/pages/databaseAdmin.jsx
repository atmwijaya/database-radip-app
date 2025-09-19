import React, { useState, useEffect } from "react";
import NavbarAdmin from "../components/navbarAdmin";
import Footer from "../../components/footer";
import { checkTokenExpiration, logout } from "../../../../backend/utils/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// Data fakultas dan jurusan
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

const DatabaseAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "nama",
    direction: "asc",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    nama: "",
    noInduk: "",
    nim: "",
    fakultas: "",
    jurusan: "",
    angkatan: "",
    tempatLahir: "",
    tanggalLahir: "",
    displayTanggalLahir: "",
    dateValue: "",
    pandega: "",
  });

  const [errors, setErrors] = useState({
    nama: "",
    nim: "",
    fakultas: "",
    jurusan: "",
    angkatan: "",
    tempatLahir: "",
    tanggalLahir: "",
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/db`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("tokenExpiration");
    navigate("/enter");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !checkTokenExpiration()) {
      logout();
    }
    fetchData();

    // Set up token expiration check every minute
    const Interval = setInterval(() => {
      if (!checkTokenExpiration()) {
        logout();
      }
    }, 60000);

    return () => {
      clearInterval(Interval);
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
    let sortableData = [...data];
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
  }, [data, sortConfig]);

  // Filter data berdasarkan search term
  const filteredData = sortedData.filter((item) => {
    return (
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.noInduk &&
        item.noInduk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fakultas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.angkatan.toString().includes(searchTerm) ||
      item.ttl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pandega &&
        item.pandega.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nim") {
      if (value.length > 14) return;
      if (value && !/^\d+$/.test(value)) return;
    }

    if (name === "nama") {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const formattedDate = `${day} ${monthNames[month]} ${year}`;
    const dbFormat = `${day}/${month + 1}/${year}`;

    setFormData({
      ...formData,
      tanggalLahir: dbFormat,
      displayTanggalLahir: formattedDate,
      dateValue: e.target.value,
    });

    setErrors({
      ...errors,
      tanggalLahir: "",
    });
  };

  // Handle fakultas change
  const handleFakultasChange = (e) => {
    const fakultas = e.target.value;
    setFormData({
      ...formData,
      fakultas,
      jurusan: "",
    });

    setJurusanOptions(fakultas ? fakultasJurusan[fakultas] || [] : []);
  };

  // Validasi form
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      nama: "",
      nim: "",
      fakultas: "",
      jurusan: "",
      angkatan: "",
      tempatLahir: "",
      tanggalLahir: "",
    };

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
      valid = false;
    }

    if (!formData.nim) {
      newErrors.nim = "NIM wajib diisi";
      valid = false;
    } else if (formData.nim.length < 13 || formData.nim.length > 14) {
      newErrors.nim = "NIM harus 13 atau 14 digit";
      valid = false;
    }

    if (!formData.fakultas) {
      newErrors.fakultas = "Fakultas wajib dipilih";
      valid = false;
    }

    if (!formData.jurusan) {
      newErrors.jurusan = "Jurusan wajib dipilih";
      valid = false;
    }

    if (!formData.angkatan) {
      newErrors.angkatan = "Angkatan wajib diisi";
      valid = false;
    }

    if (!formData.tempatLahir) {
      newErrors.tempatLahir = "Tempat lahir wajib diisi";
      valid = false;
    }

    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submit (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      let response;
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return;
      }

      const [day, month, year] = formData.tanggalLahir.split("/");
      const formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
      const ttl = `${formData.tempatLahir}, ${formattedDate}`;

      const memberData = {
        nama: formData.nama,
        noInduk: formData.noInduk || "-",
        nim: formData.nim,
        fakultas: formData.fakultas,
        jurusan: formData.jurusan,
        angkatan: formData.angkatan,
        ttl,
        pandega: formData.pandega || "-",
        tanggalLahir: formData.tanggalLahir,
      };

      if (editData) {
        response = await fetch(`${API_BASE_URL}/api/db/${editData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(memberData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/db`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(memberData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Terjadi kesalahan");
      }

      await fetchData();
      setShowAddForm(false);
      resetForm();
      setSuccessMessage(
        editData ? "Data berhasil diperbaharui!" : "Data berhasil ditambahkan!"
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err.message.includes("NIM sudah terdaftar")) {
        setErrors((prev) => ({ ...prev, nim: "NIM sudah terdaftar" }));
      } else {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      noInduk: "",
      nim: "",
      fakultas: "",
      jurusan: "",
      angkatan: "",
      tempatLahir: "",
      tanggalLahir: "",
      displayTanggalLahir: "",
      dateValue: "",
      pandega: "",
    });
    setJurusanOptions([]);
    setErrors({
      nama: "",
      nim: "",
      fakultas: "",
      jurusan: "",
      angkatan: "",
      tempatLahir: "",
      tanggalLahir: "",
    });
    setError(null);
  };

  // Handle edit - split TTL into birthplace and date
  const handleEdit = (item) => {
    setEditData(item);

    const [tempatLahir = "", tanggalLahir = ""] = item.ttl.split(", ");

    // Convert format DD/MM/YYYY ke format date input (YYYY-MM-DD)
    let dateValue = "";
    if (tanggalLahir) {
      const dateParts = tanggalLahir.trim().split(" ");
      if (dateParts.length === 3) {
        const day = dateParts[0];
        const month = monthNames.indexOf(dateParts[1]);
        const year = dateParts[2];
        if (month !== -1) {
          dateValue = `${year}-${(month + 1)
            .toString()
            .padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
    }

    setFormData({
      nama: item.nama,
      noInduk: item.noInduk === "-" ? "" : item.noInduk,
      nim: item.nim,
      fakultas: item.fakultas,
      jurusan: item.jurusan,
      angkatan: item.angkatan,
      tempatLahir: tempatLahir || "",
      tanggalLahir: item.tanggalLahir || "",
      displayTanggalLahir: tanggalLahir || "",
      dateValue: dateValue,
      pandega: item.pandega === "-" ? "" : item.pandega,
    });

    setJurusanOptions(
      item.fakultas ? fakultasJurusan[item.fakultas] || [] : []
    );
    setShowAddForm(true);
  };

  // Handle delete confirmation
  const confirmDelete = (item) => {
    setDataToDelete(item);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/db/${dataToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus data");
      }

      await fetchData();
      setShowDeleteModal(false);
      setDataToDelete(null);
      setSuccessMessage("Data berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsDeleting(false);
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
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
      if (!row.nim || !/^\d{13,14}$/.test(row.nim.toString())) {
        rowErrors.push(`NIM harus 13 atau 14 digit angka`);
      }
      
      // Validasi Nama
      if (!row.nama || typeof row.nama !== 'string') {
        rowErrors.push(`Nama harus diisi`);
      }
      
      // Validasi Fakultas
      if (!row.fakultas || !Object.keys(fakultasJurusan).includes(row.fakultas)) {
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
        // Format TTL
        const [day, month, year] = row.tanggalLahir.split('/');
        const formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
        const ttl = `${row.tempatLahir}, ${formattedDate}`;
        
        validData.push({
          nama: row.nama,
          noInduk: row.noInduk || "-",
          nim: row.nim.toString(),
          fakultas: row.fakultas,
          jurusan: row.jurusan,
          angkatan: parseInt(row.angkatan),
          ttl: ttl,
          pandega: row.pandega || "-",
          tanggalLahir: row.tanggalLahir
        });
      } else {
        errors.push({
          row: index + 2, // +2 karena header + index 0-based
          errors: rowErrors,
          data: row
        });
      }
    });
    
    return { validData, errors };
  };

  // Fungsi untuk mengirim data import ke backend
  const handleImportSubmit = async () => {
    if (importData.length === 0) return;
    try {
      setIsImporting(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/db/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: importData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengimport data");
      }
      
      await fetchData();
      setShowImportModal(false);
      setImportData([]);
      setImportErrors([]);
      setSuccessMessage(`Berhasil mengimport ${importData.length} data!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsImporting(false);
    }
  };

  // Fungsi untuk download template
  const downloadTemplate = () => {
    const templateData = [
      {
        nama: "John Doe",
        noInduk: "-",
        nim: "12345678901234",
        fakultas: "Ekonomika dan Bisnis",
        jurusan: "Manajemen",
        angkatan: "2020",
        tempatLahir: "Jakarta",
        tanggalLahir: "15/01/2002",
        pandega: "-"
      },
      {
        nama: "Jane Smith",
        noInduk: "-",
        nim: "12345678901235",
        fakultas: "Teknik",
        jurusan: "Teknik Sipil",
        angkatan: "2021",
        tempatLahir: "Surabaya",
        tanggalLahir: "20/05/2001",
        pandega: "-"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_import_anggota.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />

      <main className="flex-grow flex-wrap gap-2 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 w-full md:w-auto">
            Database Anggota
          </h1>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditData(null);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Tambah Data
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
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
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editData ? "Edit Data Anggota" : "Tambah Data Anggota Baru"}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap*
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.nama ? "border-red-500" : "border-gray-300"
                      } rounded-md`}
                      required
                    />
                    {errors.nama && (
                      <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Induk
                    </label>
                    <input
                      type="number"
                      name="noInduk"
                      value={formData.noInduk}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Opsional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIM*
                    </label>
                    <input
                      type="number"
                      name="nim"
                      value={formData.nim}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.nim ? "border-red-500" : "border-gray-300"
                      } rounded-md`}
                      required
                      maxLength={14}
                      placeholder="13 atau 14 digit angka"
                    />
                    {errors.nim && (
                      <p className="mt-1 text-sm text-red-600">{errors.nim}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fakultas*
                    </label>
                    <select
                      name="fakultas"
                      value={formData.fakultas}
                      onChange={handleFakultasChange}
                      className={`w-full p-2 border ${
                        errors.fakultas ? "border-red-500" : "border-gray-300"
                      } rounded-md`}
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {Object.keys(fakultasJurusan).map((fakultas) => (
                        <option key={fakultas} value={fakultas}>
                          {fakultas}
                        </option>
                      ))}
                    </select>
                    {errors.fakultas && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fakultas}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jurusan*
                    </label>
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.jurusan ? "border-red-500" : "border-gray-300"
                      } rounded-md`}
                      required
                      disabled={!formData.fakultas}
                    >
                      <option value="">
                        {formData.fakultas
                          ? "Pilih Jurusan"
                          : "Pilih Fakultas terlebih dahulu"}
                      </option>
                      {jurusanOptions.map((jurusan) => (
                        <option key={jurusan} value={jurusan}>
                          {jurusan}
                        </option>
                      ))}
                    </select>
                    {errors.jurusan && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.jurusan}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Angkatan*
                    </label>
                    <input
                      type="number"
                      name="angkatan"
                      value={formData.angkatan}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.angkatan ? "border-red-500" : "border-gray-300"
                      } rounded-md`}
                      required
                    />
                    {errors.angkatan && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.angkatan}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempat Lahir*
                    </label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.tempatLahir
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      required
                      placeholder="Contoh: Jakarta"
                    />
                    {errors.tempatLahir && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.tempatLahir}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir*
                    </label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      value={formData.dateValue || ""}
                      onChange={handleDateChange}
                      className={`w-full p-2 border ${
                        errors.tanggalLahir
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      required
                    />
                    {formData.displayTanggalLahir && (
                      <p className="mt-1 text-sm text-gray-500">
                        Format tampilan: {formData.displayTanggalLahir}
                      </p>
                    )}
                    {errors.tanggalLahir && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.tanggalLahir}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pandega
                    </label>
                    <input
                      type="text"
                      name="pandega"
                      value={formData.pandega}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Opsional"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[80px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-100">.</span>
                        <span className="animate-bounce delay-200">.</span>
                      </span>
                    ) : editData ? (
                      "Update"
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Import Data dari File</h2>
              
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
                  <h3 className="font-semibold mb-2">Error pada baris:</h3>
                  {importErrors.slice(0, 5).map((error, index) => (
                    <div key={index} className="mb-2">
                      <p className="font-medium">Baris {error.row}:</p>
                      <ul className="list-disc list-inside ml-4">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                      <details className="ml-4 mt-1 text-sm">
                        <summary>Data baris:</summary>
                        <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto">
                          {JSON.stringify(error.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                  {importErrors.length > 5 && (
                    <p className="mt-2">... dan {importErrors.length - 5} error lainnya</p>
                  )}
                </div>
              )}
              
              {importData.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-green-600">
                    {importData.length} data valid siap diimport
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fakultas</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importData.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm">{item.nama}</td>
                            <td className="px-3 py-2 text-sm">{item.nim}</td>
                            <td className="px-3 py-2 text-sm">{item.fakultas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 5 && (
                      <p className="mt-2 text-sm text-gray-500">
                        ... dan {importData.length - 5} data lainnya
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
                <button
                  onClick={handleImportSubmit}
                  disabled={importData.length === 0 || isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {isImporting ? (
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
                  disabled={isDeleting}
                >
                  {isDeleting ? (
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
                    <th
                      scope="col"
                      className="sticky left-0 z-40 w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50 shadow-right"
                      onClick={() => requestSort("no")}
                    >
                      No
                    </th>
                    <th
                      scope="col"
                      className="sticky left-16 z-40 min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 shadow-right"
                      onClick={() => requestSort("nama")}
                    >
                      Nama Lengkap
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("noInduk")}
                    >
                      No. Induk
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("nim")}
                    >
                      NIM
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fakultas/Jurusan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("angkatan")}
                    >
                      Angkatan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("ttl")}
                    >
                      Tempat Tanggal Lahir
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("pandega")}
                    >
                      Nama Pandega
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-30 w-16 px-6 py-4 whitespace-nowrap text-sm text-gray-500 bg-white shadow-right">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="sticky left-16 z-30 min-w-[200px] px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white shadow-right">
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
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
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
                        Tidak ada data yang ditemukan
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
          {paginatedData.length > 0 ? (
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
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
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
              Tidak ada data yang ditemukan
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