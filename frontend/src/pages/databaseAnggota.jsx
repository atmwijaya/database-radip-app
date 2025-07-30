import React, { useState, useMemo } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Image, Search } from 'lucide-react';

const DatabaseAnggota = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy member data
  const memberData = [
    {
      id: 1,
      namaLengkap: "Ahmad Rizki Pratama",
      nomorInduk: "12345678",
      nim: "24060122130001",
      fakultasJurusan: "Sains dan Matematika / Informatika",
      angkatan: "2022",
      namaPandega: "Garuda Muda"
    },
    {
      id: 2,
      namaLengkap: "Siti Nurhaliza Putri",
      nomorInduk: "12345679",
      nim: "24060122140002",
      fakultasJurusan: "Teknik / Teknik Sipil",
      angkatan: "2022",
      namaPandega: "Bintang Timur"
    },
    {
      id: 3,
      namaLengkap: "Muhammad Fajar Sidik",
      nomorInduk: "12345680",
      nim: "24060121130003",
      fakultasJurusan: "Ekonomika dan Bisnis / Manajemen",
      angkatan: "2021",
      namaPandega: "Wijaya Kusuma"
    },
    {
      id: 4,
      namaLengkap: "Dewi Sartika Maharani",
      nomorInduk: "12345681",
      nim: "24060123150004",
      fakultasJurusan: "Ilmu Budaya / Sastra Indonesia",
      angkatan: "2023",
      namaPandega: "Melati Putih"
    },
    {
      id: 5,
      namaLengkap: "Budi Santoso Wijaya",
      nomorInduk: "12345682",
      nim: "24060120130005",
      fakultasJurusan: "Kedokteran / Pendidikan Dokter",
      angkatan: "2020",
      namaPandega: "Elang Jawa"
    }
  ];

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return memberData.filter(member =>
      member.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.nomorInduk.includes(searchQuery) ||
      member.nim.includes(searchQuery) ||
      member.fakultasJurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.angkatan.includes(searchQuery) ||
      member.namaPandega.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, memberData]);

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
            
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan nama, NIM, nomor induk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
          </div>

          {/* Results section */}
          {searchQuery.trim() && (
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
                            Nomor Induk
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
                            Nama Pandega
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {member.namaLengkap}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.nomorInduk}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.nim}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.fakultasJurusan}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.angkatan}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {member.namaPandega}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {member.namaLengkap}
                            </h3>
                            <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {member.angkatan}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                            <div>
                              <span className="font-medium">No. Induk:</span> {member.nomorInduk}
                            </div>
                            <div>
                              <span className="font-medium">NIM:</span> {member.nim}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-medium">Fakultas:</span> {member.fakultasJurusan}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-medium">Pandega:</span> {member.namaPandega}
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
                    Coba gunakan kata kunci yang berbeda atau periksa ejaan Anda.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions when no search query */}
          {!searchQuery.trim() && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Mulai pencarian anggota
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm sm:max-w-md mx-auto px-4">
                Ketikkan nama, NIM, nomor induk, atau informasi lainnya pada kolom pencarian di atas untuk menemukan data anggota.
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