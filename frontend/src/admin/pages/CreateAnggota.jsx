import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/navbarAdmin";
import { useQueryClient } from "@tanstack/react-query"; // Tambahkan ini

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
    "Perikanan Tangcap",
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

const CreateAnggota = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Tambahkan ini
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
    nama: "",
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
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Tambahkan state untuk success message

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
        jenjang: formData.jenjang,
        tanggalDilantik: formData.tanggalDilantik,
        ttl,
        pandega: formData.pandega || "-",
        tanggalLahir: formData.tanggalLahir,
      };

      const response = await fetch(`${API_BASE_URL}/api/db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Terjadi kesalahan");
      }

      // Invalidate cache untuk memaksa refetch data terbaru
      await Promise.all([
        queryClient.invalidateQueries(['members', 'admin']),
        queryClient.invalidateQueries(['members', 'public']),
      ]);
      
      // Refresh queries untuk memastikan data terbaru
      await queryClient.refetchQueries({
        predicate: (query) => 
          query.queryKey[0] === 'members'
      });

      // Reset form
      resetForm();

      // Tampilkan success message
      setSuccessMessage("✅ Data berhasil ditambahkan!");
      
      // Notify parent component jika ada
      if (onSuccess) {
        onSuccess("Data berhasil ditambahkan!");
      }

      // Tunggu sebentar agar user bisa melihat pesan sukses
      setTimeout(() => {
        setSuccessMessage(null);
        // Redirect ke halaman database dengan data terbaru
        navigate("/admin/database-anggota");
      }, 1500);

    } catch (err) {
      if (err.message.includes("NIM sudah terdaftar")) {
        setErrors((prev) => ({ ...prev, nim: "NIM sudah terdaftar" }));
      } else {
        setErrorMessage(err.message);
        setTimeout(() => setErrorMessage(null), 5000);
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
    setErrorMessage(null);
  };

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
              Tambah Anggota Baru
            </h1>
            <p className="text-gray-600 mt-2">
              Isi data anggota dengan lengkap dan benar
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
              {errorMessage}
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
                      placeholder="Masukkan nama lengkap"
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
                      placeholder="Opsional"
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
                      placeholder="13 atau 14 digit angka"
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
                      placeholder="Contoh: 2023"
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
                      placeholder="Contoh: Jakarta"
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
                      placeholder="Opsional"
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
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Data"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/admin/database-anggota")}
                className="px-4 py-2 text-gray-600"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAnggota;