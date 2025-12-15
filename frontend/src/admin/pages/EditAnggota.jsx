import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarAdmin from "../components/navbarAdmin";
import { useQueryClient } from "@tanstack/react-query";

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

const EditAnggota = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    nama: "",
    noInduk: "",
    nim: "",
    fakultas: "",
    jurusan: "",
    angkatan: "",
    jenjang: "muda",
    tanggalDilantik: "",
    tempatLahir: "",
    tanggalLahir: "",
    displayTanggalLahir: "",
    dateValue: "",
    pandega: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    nim: "",
    fakultas: "",
    jurusan: "",
    angkatan: "",
    jenjang: "",
    tanggalDilantik: "",
    tempatLahir: "",
    tanggalLahir: "",
  });

  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch member data
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/enter");
          return;
        }

        console.log("Fetching member data for ID:", id);
        console.log("API URL:", `${API_BASE_URL}/api/db/${id}`);

        const response = await fetch(`${API_BASE_URL}/api/db/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (response.status === 404) {
          throw new Error("Data anggota tidak ditemukan");
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error text:", errorText);
          throw new Error(
            `Gagal mengambil data anggota: ${response.status} ${response.statusText}`
          );
        }

        const item = await response.json();
        console.log("Data received from API:", item);

        console.log("All fields from MongoDB:", Object.keys(item));
        console.log("MongoDB data:", item);

        const ttlString = item.til || item.ttl || "";
        console.log("TTL string from MongoDB:", ttlString);

        let tempatLahir = "";
        let tanggalLahir = "";
        let dateValue = "";

        if (ttlString) {
          const ttlParts = ttlString.split(", ");
          console.log("TTL parts:", ttlParts);

          if (ttlParts.length >= 1) {
            tempatLahir = ttlParts[0] || "";
          }

          if (ttlParts.length >= 2) {
            tanggalLahir = ttlParts[1] || "";
            console.log("Raw tanggal lahir:", tanggalLahir);
            const dateMatch1 = tanggalLahir.match(/(\d{1,2}) (\w+) (\d{4})/);
            if (dateMatch1) {
              const day = dateMatch1[1];
              const monthName = dateMatch1[2];
              const year = dateMatch1[3];
              const monthIndex = monthNames.findIndex(
                (m) => m.toLowerCase() === monthName.toLowerCase()
              );

              if (monthIndex !== -1) {
                dateValue = `${year}-${(monthIndex + 1)
                  .toString()
                  .padStart(2, "0")}-${day.padStart(2, "0")}`;
                console.log("Parsed date (format 1):", dateValue);
              }
            }
            else if (tanggalLahir.includes("/")) {
              const [day, month, year] = tanggalLahir.split("/");
              dateValue = `${year}-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
              )}`;
              console.log("Parsed date (format 2):", dateValue);
            }
          }
        }

        const newFormData = {
          nama: item.nama || "", 
          noInduk: item.noInduk === "-" ? "" : item.noInduk || "",
          nim: item.nim || "",
          fakultas: item.fakultas || "",
          jurusan: item.jurusan || "",
          angkatan: item.angkatan || "",
          jenjang: item.jenjang || "muda",
          tanggalDilantik: item.tanggalDilantik
            ? new Date(item.tanggalDilantik).toISOString().split("T")[0]
            : "",
          tempatLahir: tempatLahir,
          tanggalLahir: tanggalLahir,
          displayTanggalLahir: tanggalLahir,
          dateValue: dateValue,
          pandega: item.pandega === "-" ? "" : item.pandega || "",
        };

        console.log("Form data to set:", newFormData);

        setFormData(newFormData);

        if (item.fakultas && fakultasJurusan[item.fakultas]) {
          setJurusanOptions(fakultasJurusan[item.fakultas]);
        } else {
          setJurusanOptions([]);
        }
      } catch (err) {
        console.error("Error in fetchMemberData:", err);
        setErrorMessage(err.message || "Terjadi kesalahan saat mengambil data");
        setTimeout(() => setErrorMessage(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    }
  }, [id, navigate, API_BASE_URL]);

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
    if (isNaN(date.getTime())) {
      setErrors({
        ...errors,
        tanggalLahir: "Tanggal tidak valid",
      });
      return;
    }

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
      jenjang: "",
      tanggalDilantik: "",
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

    if (!formData.jenjang) {
      newErrors.jenjang = "Jenjang wajib dipilih";
      valid = false;
    } else if (!["muda", "madya", "bhakti"].includes(formData.jenjang)) {
      newErrors.jenjang = "Jenjang harus: muda, madya, atau bhakti";
      valid = false;
    }

    if (!formData.tanggalDilantik) {
      newErrors.tanggalDilantik = "Tanggal dilantik wajib diisi";
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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/enter");
        return;
      }

      let tanggalLahirForDB = "";
      if (formData.dateValue) {
        const date = new Date(formData.dateValue);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        tanggalLahirForDB = `${day}/${month}/${year}`;
      } else if (formData.tanggalLahir) {
        tanggalLahirForDB = formData.tanggalLahir;
      }

      const til = `${formData.tempatLahir}, ${
        formData.displayTanggalLahir || formData.tanggalLahir
      }`;

      const memberData = {
        nama: formData.nama,
        noInduk: formData.noInduk || "-",
        nim: formData.nim,
        fakultas: formData.fakultas,
        jurusan: formData.jurusan,
        angkatan: formData.angkatan,
        jenjang: formData.jenjang,
        tanggalDilantik: formData.tanggalDilantik,
        til: til,
        pandega: formData.pandega || "-",
        tanggalLahir: tanggalLahirForDB,
      };
      await queryClient.cancelQueries(["members", "admin"]);
      await queryClient.cancelQueries(["members", "public"]);
      const previousAdminData = queryClient.getQueryData(["members", "admin"]);
      const previousPublicData = queryClient.getQueryData([
        "members",
        "public",
      ]);

      if (previousAdminData) {
        queryClient.setQueryData(["members", "admin"], (old) => {
          if (!old) return old;
          return old.map((member) =>
            member._id === id ? { ...member, ...memberData } : member
          );
        });
      }

      if (previousPublicData) {
        queryClient.setQueryData(["members", "public"], (old) => {
          if (!old) return old;
          return old.map((member) =>
            member._id === id ? { ...member, ...memberData } : member
          );
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/db/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      console.log("Update response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Terjadi kesalahan saat memperbarui data";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Update error data:", errorData);
        } catch (parseError) {
          const errorText = await response.text();
          console.error("Update error text:", errorText);
          errorMessage = errorText || errorMessage;
        }
        if (previousAdminData) {
          queryClient.setQueryData(["members", "admin"], previousAdminData);
        }
        if (previousPublicData) {
          queryClient.setQueryData(["members", "public"], previousPublicData);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Update successful:", result);
      queryClient.invalidateQueries(["members", "admin"]);
      queryClient.invalidateQueries(["members", "public"]);

      setSuccessMessage("✅ Data berhasil diperbaharui!");
      setTimeout(() => {
        setSuccessMessage(null);
        navigate("/admin/database-anggota");
      }, 1500);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      if (err.message.includes("NIM sudah terdaftar")) {
        setErrors((prev) => ({ ...prev, nim: "NIM sudah terdaftar" }));
      } else {
        setErrorMessage(
          err.message || "Terjadi kesalahan saat memperbarui data"
        );
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
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

        setSuccessMessage("✅ Data berhasil dihapus!");
        setTimeout(() => {
          setSuccessMessage(null);
          navigate("/admin/database");
        }, 2000);
      } catch (err) {
        setErrorMessage(err.message || "Terjadi kesalahan saat menghapus data");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data anggota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/database-anggota")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Database
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Data Anggota
            </h1>
            <p className="text-gray-600 mt-2">
              Perbarui data anggota dengan informasi yang benar
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Row 1: Nama & No. Induk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama" 
                      value={formData.nama}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.nama ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.nama && (
                      <p className="mt-2 text-sm text-red-600">{errors.nama}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Induk
                    </label>
                    <input
                      type="text"
                      name="noInduk"
                      value={formData.noInduk}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Row 2: NIM & Fakultas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIM<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nim"
                      value={formData.nim}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.nim ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.nim && (
                      <p className="mt-2 text-sm text-red-600">{errors.nim}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fakultas<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fakultas"
                      value={formData.fakultas}
                      onChange={handleFakultasChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.fakultas ? "border-red-500" : "border-gray-300"
                      }`}
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
                      <p className="mt-2 text-sm text-red-600">
                        {errors.fakultas}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Jurusan & Angkatan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurusan<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.jurusan ? "border-red-500" : "border-gray-300"
                      }`}
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
                      <p className="mt-2 text-sm text-red-600">
                        {errors.jurusan}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Angkatan<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="angkatan"
                      value={formData.angkatan}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.angkatan ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.angkatan && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.angkatan}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 4: Tempat Lahir & Tanggal Lahir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempat Lahir<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.tempatLahir
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.tempatLahir && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.tempatLahir}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      value={formData.dateValue || ""}
                      onChange={handleDateChange}
                      className={`w-full p-3 border rounded-lg ${
                        errors.tanggalLahir
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {formData.displayTanggalLahir && (
                      <p className="mt-2 text-sm text-gray-500">
                        Format: {formData.displayTanggalLahir}
                      </p>
                    )}
                    {errors.tanggalLahir && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.tanggalLahir}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 5: Pandega */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pandega
                    </label>
                    <input
                      type="text"
                      name="pandega"
                      value={formData.pandega}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Row 6: Jenjang & Tanggal Dilantik */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenjang<span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, jenjang: "muda" })
                        }
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          formData.jenjang === "muda"
                            ? "bg-green-100 text-green-800 border-2 border-green-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Muda
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, jenjang: "madya" })
                        }
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          formData.jenjang === "madya"
                            ? "bg-red-100 text-red-800 border-2 border-red-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Madya
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, jenjang: "bhakti" })
                        }
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          formData.jenjang === "bhakti"
                            ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Bhakti
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Dilantik<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggalDilantik"
                      value={formData.tanggalDilantik || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggalDilantik: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse md:flex-row justify-between gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/database-anggota")}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Batal
                  </button>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Hapus Data
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Memperbarui...
                        </>
                      ) : (
                        "Update Data"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAnggota;
