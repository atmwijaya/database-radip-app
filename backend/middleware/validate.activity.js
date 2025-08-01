export function validateMember(req, res, next) {
  const { nama, nim, fakultas, jurusan, angkatan, ttl } = req.body;
  const errors = {};
  
  if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
    errors.nama = 'Nama lengkap wajib diisi';
  }
  
  if (!nim || typeof nim !== 'string' || nim.length !== 14 || !/^\d+$/.test(nim)) {
    errors.nim = 'NIM harus 14 digit angka';
  }
  
  if (!fakultas || typeof fakultas !== 'string' || fakultas.trim().length === 0) {
    errors.fakultas = 'Fakultas wajib dipilih';
  }
  
  if (!jurusan || typeof jurusan !== 'string' || jurusan.trim().length === 0) {
    errors.jurusan = 'Jurusan wajib dipilih';
  }
  
  if (!angkatan || isNaN(angkatan) || angkatan < 2000 || angkatan > new Date().getFullYear()) {
    errors.angkatan = 'Angkatan harus tahun yang valid';
  }
  
  if (!ttl || typeof ttl !== 'string' || ttl.trim().length === 0) {
    errors.ttl = 'TTL wajib diisi';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}