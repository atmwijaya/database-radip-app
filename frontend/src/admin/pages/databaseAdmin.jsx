import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../components/navbarAdmin';
import Footer from '../../components/footer';

// Data fakultas dan jurusan
const fakultasJurusan = {
  'Hukum': ['Hukum'],
  'Ekonomi': ['Akuntansi', 'Ilmu Ekonomi', 'Manajemen', 'Ekonomi Islam', 'Bisnis Digital'],
  'Teknik': ['Teknik Sipil', 'Arsitektur', 'Teknik Kimia', 'Teknik Mesin', 'Teknik Elektro', 'Perencanaan Wilayah dan Kota', 'Teknik Industri', 'Teknik Lingkungan', 'Teknik Perkapalan', 'Teknik Geologi', 'Teknik Geodesi', 'Teknik Komputer'],
  'Kedokteran': ['Kedokteran', 'Ilmu Gizi', 'Keperawatan', 'Farmasi', 'Kedokteran Gigi'],
  'Peternakan dan Pertanian': ['Peternakan', 'Agribisnis', 'Agroteknologi', 'Teknologi Pangan'],
  'Ilmu Budaya' : ['Sastra Inggris', 'Sastra Indonesia', 'Sejarah', 'Ilmu Perpustakaan', 'Antropologi Sosial', 'Bahasa dan Kebudayaan Jepang'],
  'Ilmu Sosial dan Politik': ['Administrasi Publik', 'Administrasi Bisnis', 'Ilmu Pemerintahan', 'Ilmu Komunikasi', 'Hubungan Internasional'],
  'Sains dan Matematika': ['Matematika', 'Biologi', 'Kimia', 'Fisika', 'Statistika', 'Bioteknologi', 'Informatika'],
  'Kesehatan Masyarakat' : ['Kesehatan Masyarakat', 'Kesehatan dan Keselamatan Kerja'],
  'Perikanan dan Ilmu Kelautan' : ['Akuakultur', 'Ilmu Kelautan', 'Manajemen Sumber Daya Perairan', 'Oseanografi', 'Perikanan Tangkap', 'Teknologi Hasil Perikanan'],
  'Psikologi': ['Psikologi'],
  'Vokasi' : ['Teknik Infrastruktur Sipil dan Perancanaan Arsitektur', 'Perencanaan Tata Ruang dan Pertanahan', 'Teknologi Rekayasa Kimia Industri', 'Teknologi Rekayasa Otomasi', 'Teknologi Rekayasa Konstruksi Perkapalan', 'Teknik Listrik Industri', 'Akuntansi Perpajakan', 'Manajemen dan Administrasi Logistik', 'Bahasa Terapan Asing', 'Informasi dan Hubungan Masyarakat']
};

const DatabaseAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    nama: '',
    noInduk: '',
    nim: '',
    fakultas: '',
    jurusan: '',
    angkatan: '',
    tempatLahir: '',
    tanggalLahir: '',
    pandega: ''
  });

  const [errors, setErrors] = useState({
    nama: '',
    nim: '',
    fakultas: '',
    jurusan: '',
    angkatan: '',
    tempatLahir: '',
    tanggalLahir: ''
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/database`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }
      
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted data
  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
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
      (item.noInduk && item.noInduk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fakultas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.angkatan.toString().includes(searchTerm) ||
      item.ttl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pandega && item.pandega.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nim') {
      if (value.length > 14) return;
      if (value && !/^\d+$/.test(value)) return;
    }
    
    if (name === 'nama') {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Handle fakultas change
  const handleFakultasChange = (e) => {
    const fakultas = e.target.value;
    setFormData({
      ...formData,
      fakultas,
      jurusan: ''
    });
    
    setJurusanOptions(fakultas ? fakultasJurusan[fakultas] || [] : []);
  };

  // Validasi form
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      nama: '',
      nim: '',
      fakultas: '',
      jurusan: '',
      angkatan: '',
      tempatLahir: '',
      tanggalLahir: ''
    };
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama lengkap wajib diisi';
      valid = false;
    }
    
    if (!formData.nim) {
      newErrors.nim = 'NIM wajib diisi';
      valid = false;
    } else if (formData.nim.length !== 14) {
      newErrors.nim = 'NIM harus 14 digit';
      valid = false;
    }
    
    if (!formData.fakultas) {
      newErrors.fakultas = 'Fakultas wajib dipilih';
      valid = false;
    }
    
    if (!formData.jurusan) {
      newErrors.jurusan = 'Jurusan wajib dipilih';
      valid = false;
    }
    
    if (!formData.angkatan) {
      newErrors.angkatan = 'Angkatan wajib diisi';
      valid = false;
    }
    
    if (!formData.tempatLahir) {
      newErrors.tempatLahir = 'Tempat lahir wajib diisi';
      valid = false;
    }
    
    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
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
      let response;
      const token = localStorage.getItem('token');
      
      const ttl = `${formData.tempatLahir}, ${formData.tanggalLahir}`;
      
      const memberData = {
        nama: formData.nama,
        noInduk: formData.noInduk || '-',
        nim: formData.nim,
        fakultas: formData.fakultas,
        jurusan: formData.jurusan,
        angkatan: formData.angkatan,
        ttl,
        pandega: formData.pandega || '-'
      };

      if (editData) {
        response = await fetch(`${API_BASE_URL}/api/database/${editData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(memberData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/database`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(memberData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan');
      }
      
      await fetchData();
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      if (err.message.includes('NIM sudah terdaftar')) {
        setErrors(prev => ({...prev, nim: 'NIM sudah terdaftar'}));
      } else {
        setError(err.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      noInduk: '',
      nim: '',
      fakultas: '',
      jurusan: '',
      angkatan: '',
      tempatLahir: '',
      tanggalLahir: '',
      pandega: ''
    });
    setJurusanOptions([]);
    setErrors({
      nama: '',
      nim: '',
      fakultas: '',
      jurusan: '',
      angkatan: '',
      tempatLahir: '',
      tanggalLahir: ''
    });
    setError(null);
  };

  // Handle edit - split TTL into birthplace and date
  const handleEdit = (item) => {
    setEditData(item);
    
    const [tempatLahir = '', tanggalLahir = ''] = item.ttl.split(', ');
    
    setFormData({
      nama: item.nama,
      noInduk: item.noInduk === '-' ? '' : item.noInduk,
      nim: item.nim,
      fakultas: item.fakultas,
      jurusan: item.jurusan,
      angkatan: item.angkatan,
      tempatLahir: tempatLahir || '',
      tanggalLahir: tanggalLahir || '',
      pandega: item.pandega === '-' ? '' : item.pandega
    });
    
    setJurusanOptions(item.fakultas ? fakultasJurusan[item.fakultas] || [] : []);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/database/${dataToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus data');
      }
      
      await fetchData();
      setShowDeleteModal(false);
      setDataToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Database Anggota</h1>
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
        </div>

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
                {editData ? 'Edit Data Anggota' : 'Tambah Data Anggota Baru'}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap*</label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                    />
                    {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Induk</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM*</label>
                    <input
                      type="number"
                      name="nim"
                      value={formData.nim}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.nim ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                      maxLength={14}
                      placeholder="14 digit angka"
                    />
                    {errors.nim && <p className="mt-1 text-sm text-red-600">{errors.nim}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas*</label>
                    <select
                      name="fakultas"
                      value={formData.fakultas}
                      onChange={handleFakultasChange}
                      className={`w-full p-2 border ${errors.fakultas ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {Object.keys(fakultasJurusan).map((fakultas) => (
                        <option key={fakultas} value={fakultas}>{fakultas}</option>
                      ))}
                    </select>
                    {errors.fakultas && <p className="mt-1 text-sm text-red-600">{errors.fakultas}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan*</label>
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.jurusan ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                      disabled={!formData.fakultas}
                    >
                      <option value="">{formData.fakultas ? 'Pilih Jurusan' : 'Pilih Fakultas terlebih dahulu'}</option>
                      {jurusanOptions.map((jurusan) => (
                        <option key={jurusan} value={jurusan}>{jurusan}</option>
                      ))}
                    </select>
                    {errors.jurusan && <p className="mt-1 text-sm text-red-600">{errors.jurusan}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan*</label>
                    <input
                      type="number"
                      name="angkatan"
                      value={formData.angkatan}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.angkatan ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                    />
                    {errors.angkatan && <p className="mt-1 text-sm text-red-600">{errors.angkatan}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir*</label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.tempatLahir ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                      placeholder="Contoh: Jakarta"
                    />
                    {errors.tempatLahir && <p className="mt-1 text-sm text-red-600">{errors.tempatLahir}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir*</label>
                    <input
                      type="text"
                      name="tanggalLahir"
                      value={formData.tanggalLahir}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${errors.tanggalLahir ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      required
                      placeholder="Contoh: 10 Jan 2000"
                    />
                    {errors.tanggalLahir && <p className="mt-1 text-sm text-red-600">{errors.tanggalLahir}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pandega</label>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editData ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus Data</h3>
              <p className="mb-6">Apakah Anda yakin ingin menghapus data {dataToDelete?.nama}?</p>
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
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table - Desktop */}
        <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50 shadow-right"
                    onClick={() => requestSort('no')}
                  >
                    No
                  </th>
                  <th
                    scope="col"
                    className="sticky left-12 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 shadow-right cursor-pointer"
                    onClick={() => requestSort('nama')}
                  >
                    Nama Lengkap
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('noInduk')}
                  >
                    No. Induk
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('nim')}
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
                    onClick={() => requestSort('angkatan')}
                  >
                    Angkatan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('ttl')}
                  >
                    TTL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('pandega')}
                  >
                    Nama Pandega
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm text-gray-500 bg-white shadow-right">{index + 1}</td>
                      <td className="sticky left-12 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white shadow-right">{item.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.noInduk}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nim}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.fakultas}/{item.jurusan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.angkatan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ttl}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.pandega}</td>
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
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Table - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.nama}</h3>
                    <p className="text-sm text-gray-500">{item.nim}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">No. Induk</p>
                    <p>{item.noInduk}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fakultas/Jurusan</p>
                    <p>{item.fakultas}/{item.jurusan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Angkatan</p>
                    <p>{item.angkatan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">TTL</p>
                    <p>{item.ttl}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pandega</p>
                    <p>{item.pandega}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              Tidak ada data yang ditemukan
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DatabaseAdmin;