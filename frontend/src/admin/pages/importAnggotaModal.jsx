import React, { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const ImportAnggotaModal = ({
  onClose,
  onSuccess,
  onError,
  queryClient,
  monthNames,
  fakultasJurusan,
}) => {
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Mutation untuk import members
  const importMutation = useMutation({
    mutationFn: importMembers,
    onSuccess: (result) => {
      // Invalidate dan refetch query members
      queryClient.invalidateQueries(["members", "admin"]);

      // Handle error dari backend
      if (result.details?.errors?.length > 0) {
        const backendErrors = result.details.errors.map((err, index) => ({
          row: index + 1,
          error: err.error || "Error tidak diketahui",
          data: err,
        }));
        setImportErrors(backendErrors);

        if (result.details.success > 0) {
          onSuccess(
            `Berhasil mengimport ${result.details.success} data, tetapi ${result.details.errors.length} data gagal.`
          );
        }
      } else {
        let successCount =
          result.details?.success ||
          result.inserted ||
          result.success ||
          importData.length;
        let duplicateCount =
          result.details?.duplicates || result.duplicates || 0;

        if (duplicateCount > 0) {
          onSuccess(
            `Berhasil mengimport ${successCount} data! ⚠️ ${duplicateCount} data duplikat tidak diimport.`
          );
        } else {
          onSuccess(`✅ Berhasil mengimport ${successCount} data!`);
        }

        // Reset modal jika tidak ada error
        if (result.details?.errors?.length === 0) {
          onClose();
          setImportData([]);
          setImportErrors([]);
        }
      }
    },
    onError: (error) => {
      onError(error.message || "Terjadi kesalahan saat mengimport data");
    },
  });

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

      if (!row.jenjang || !["muda", "madya", "bhakti"].includes(row.jenjang)) {
        rowErrors.push("Jenjang harus diisi dengan: muda, madya, atau bhakti");
      }

      // Validasi Tanggal Dilantik (format DD/MM/YYYY)
      if (!row.tanggalDilantik) {
        rowErrors.push("Tanggal dilantik harus diisi");
      } else if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(row.tanggalDilantik)) {
        rowErrors.push("Format tanggal dilantik harus DD/MM/YYYY");
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
        // Format tanggal lahir untuk TTL
        const [day, month, year] = row.tanggalLahir.split("/");
        const formattedDate = `${day} ${
          monthNames[parseInt(month) - 1]
        } ${year}`;
        const ttl = `${row.tempatLahir}, ${formattedDate}`;

        // Format tanggal dilantik
        const [dayDilantik, monthDilantik, yearDilantik] =
          row.tanggalDilantik.split("/");
        const formattedTanggalDilantik = `${yearDilantik}-${monthDilantik.padStart(
          2,
          "0"
        )}-${dayDilantik.padStart(2, "0")}`;

        validData.push({
          nama: row.nama,
          noInduk: row.noInduk || "-",
          nim: row.nim,
          fakultas: row.fakultas,
          jurusan: row.jurusan,
          angkatan: parseInt(row.angkatan),
          jenjang: row.jenjang,
          tanggalDilantik: formattedTanggalDilantik,
          tempatLahir: row.tempatLahir,
          tanggalLahir: row.tanggalLahir,
          ttl: ttl,
          pandega: row.pandega || "-",
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

  // Process uploaded file
  const processFile = useCallback((file) => {
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
        onError("Gagal membaca file: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [validateImportData, onError]);

  // Handle drag and drop events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Check for duplicates
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

  // Handle import submit
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
        jenjang: "Muda",
        tanggalDilantik: "'15/01/2024",
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
        jenjang: "Muda",
        tanggalDilantik: "'15/01/2024",
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
      ["5. Kolom noInduk dan pandega opsional (isi '-' jika kosong)"],
      ["6. Bagian NIM dan semua format tanggal diawali dengan (')"],
      ["7. Gunakan huruf Kapital"]
      ["8. Jika sudah paham, hapus instruksi ini dari excel sebelum import data"]
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

      const dateDilantikCell = XLSX.utils.encode_cell({ r: R, c: 7 });
      if (worksheet[dateDilantikCell]) {
        worksheet[dateDilantikCell].t = "s";
        worksheet[dateDilantikCell].z = "@";
      }

      const dateLahirCell = XLSX.utils.encode_cell({ r: R, c: 9 });
      if (worksheet[dateLahirCell]) {
        worksheet[dateLahirCell].t = "s";
        worksheet[dateLahirCell].z = "@";
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_import_anggota.xlsx");
  };

  // Remove duplicates
  const handleRemoveDuplicates = () => {
    const uniqueData = [];
    const nimSet = new Set();

    importData.forEach((item) => {
      if (!nimSet.has(item.nim)) {
        nimSet.add(item.nim);
        uniqueData.push(item);
      }
    });

    setImportData(uniqueData);
    onSuccess(
      `Data duplikat telah dihapus. Tinggal ${uniqueData.length} data unik.`
    );
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header dengan background yang sama seperti navbarAdmin */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Import Data Anggota
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Drag & Drop Area */}
        <div
          className={`mb-6 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="text-center">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Seret dan lepas file Excel/CSV di sini
            </p>
            <p className="text-sm text-gray-500 mb-4">
              atau klik untuk memilih file dari komputer
            </p>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
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
              <span className="text-blue-600 font-medium">Pilih File</span>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Format yang didukung: .xlsx, .xls, .csv
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <p className="font-medium text-blue-800">
                <span className="inline-flex items-center">
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Template
                </span>
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Gunakan template ini untuk memastikan format data yang benar. 
                Kolom noInduk dan pandega opsional (isi '-' jika kosong).
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white transition-colors inline-flex items-center"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Template Excel
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {importErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">
                  Error Validasi Data ({importErrors.length} error)
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {importErrors.slice(0, 5).map((error, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-red-400 pl-3 py-2"
                    >
                      <p className="font-medium text-red-700 text-sm">
                        Baris {error.row}:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-600 mt-1 space-y-1">
                        {error.errors.slice(0, 3).map((err, i) => (
                          <li key={i} className="text-xs">
                            {err}
                          </li>
                        ))}
                      </ul>
                      {error.errors.length > 3 && (
                        <p className="text-xs text-red-500 mt-1">
                          ... dan {error.errors.length - 3} error lainnya
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {importErrors.length > 5 && (
                  <p className="mt-3 text-sm text-red-600">
                    ... dan {importErrors.length - 5} error lainnya
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {importData.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-0">
                Preview Data ({importData.length} data valid)
              </h3>
              {checkForDuplicates(importData).length > 0 && (
                <button
                  onClick={handleRemoveDuplicates}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200 transition-colors inline-flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Hapus Duplikat
                </button>
              )}
            </div>

            {/* Data Preview Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIM
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Induk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fakultas/Jurusan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Angkatan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TTL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pandega
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importData.slice(0, 10).map((item, index) => {
                      const isDuplicate = checkForDuplicates(importData).some(
                        (dup) => dup.nim === item.nim && dup.row !== index + 1
                      );

                      return (
                        <tr
                          key={index}
                          className={
                            isDuplicate
                              ? "bg-yellow-50 hover:bg-yellow-100"
                              : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.nama}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                    item.jenjang === "muda"
                                      ? "bg-green-100 text-green-800"
                                      : item.jenjang === "madya"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.jenjang}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {item.nim}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.noInduk || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{item.fakultas}</div>
                              <div className="text-gray-500">{item.jurusan}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.angkatan}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{item.tempatLahir}</div>
                              <div className="text-xs text-gray-400">
                                {item.tanggalLahir}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.pandega || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {isDuplicate ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠️ Duplikat
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {importData.length > 10 && (
                <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                  Menampilkan 10 dari {importData.length} data
                </div>
              )}
            </div>

            {/* Duplicate Warning */}
            {(() => {
              const duplicates = checkForDuplicates(importData);
              if (duplicates.length > 0) {
                return (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-yellow-800">
                          Peringatan: {duplicates.length} Data Duplikat Ditemukan
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Data dengan NIM yang sama tidak akan diimport. Klik
                          "Hapus Duplikat" untuk membersihkan data sebelum
                          import.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              onClose();
              setImportData([]);
              setImportErrors([]);
            }}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Batal
          </button>

          {importData.length > 0 && (
            <button
              onClick={handleImportSubmit}
              disabled={importMutation.isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center min-w-[140px]"
            >
              {importMutation.isLoading ? (
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
                  Mengimport...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Import {importData.length} Data
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportAnggotaModal;
