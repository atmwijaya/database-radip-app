import React, { useMemo } from "react";
import { motion } from "framer-motion";

const StepTwoSection = ({
  selectedMembers,
  pandegaData,
  setPandegaData,
  error,
  setError
}) => {
  // Update nama pandega untuk anggota tertentu
  const updatePandegaForMember = (memberId, namaPandega) => {
    setPandegaData(prev => ({
      ...prev,
      [memberId]: namaPandega
    }));
    
    // Clear error when data changes
    if (error && error.includes("Pandega")) {
      setTimeout(() => setError(null), 1000);
    }
  };

  // Hitung berapa yang sudah terisi
  const filledCount = useMemo(() => {
    return Object.keys(pandegaData).filter(id => pandegaData[id]?.trim()).length;
  }, [pandegaData]);

  // Progress percentage
  const progressPercentage = useMemo(() => {
    return selectedMembers.length > 0 ? (filledCount / selectedMembers.length) * 100 : 0;
  }, [filledCount, selectedMembers.length]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Isi Nama Pandega untuk Kenaikan ke Bhakti
        </h3>
        <p className="text-gray-600">
          Setiap anggota yang naik ke jenjang Bhakti wajib memiliki nama Pandega
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {filledCount}/{selectedMembers.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2.5 rounded-full ${
              progressPercentage === 100 ? "bg-green-600" : "bg-blue-600"
            }`}
          ></motion.div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {progressPercentage === 100 
            ? "✅ Semua nama Pandega sudah terisi" 
            : "Isi nama Pandega untuk semua anggota di bawah"}
        </p>
      </div>

      {/* Members List with Pandega Form */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
        {selectedMembers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8 text-gray-500">
              Tidak ada anggota yang dipilih
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {selectedMembers.map((member) => (
              <div
                key={member._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.nama}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {member.nim}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {member.fakultas}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Angkatan {member.angkatan}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800"
                    >
                      Madya
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800"
                    >
                      Bhakti
                    </span>
                  </div>
                </div>
                
                {/* Pandega Form */}
                <div className="pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pandega <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={pandegaData[member._id] || ""}
                      onChange={(e) => updatePandegaForMember(member._id, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan nama pandega"
                      required
                    />
                    <div className="w-10 flex items-center justify-center">
                      {pandegaData[member._id]?.trim() ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {pandegaData[member._id]?.trim() && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Nama Pandega telah diisi
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Tips:</p>
            <p className="text-xs text-blue-700">
              • Nama Pandega adalah nama senior yang membimbing anggota selama jenjang Madya<br/>
              • Pastikan nama ditulis dengan benar sesuai identitas<br/>
              • Jika ada perubahan nama Pandega, bisa diubah di edit anggota nanti
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwoSection;