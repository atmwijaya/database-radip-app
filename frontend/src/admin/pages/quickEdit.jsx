import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StepOneSection from "../components/quickEdit/stepOneSection";
import StepTwoSection from "../components/quickEdit/stepTwoSection";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchAllMembers = async () => {
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

const QuickEdit = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newJenjang, setNewJenjang] = useState("");
  const [tanggalDilantik, setTanggalDilantik] = useState("");
  const [pandegaData, setPandegaData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", "quickedit"],
    queryFn: fetchAllMembers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Set default tanggal dilantik ke hari ini secara live
  useEffect(() => {
    const updateCurrentDate = () => {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      setTanggalDilantik(formattedDate);
    };
    
    updateCurrentDate();
    const interval = setInterval(updateCurrentDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Hitung total steps berdasarkan newJenjang
  const getTotalSteps = () => {
    return newJenjang === "bhakti" ? 3 : 2;
  };

  const totalSteps = getTotalSteps();

  // Handle next step
  const handleNextStep = () => {
    // Validasi step 1
    if (currentStep === 1) {
      if (selectedMembers.length === 0) {
        setError("Pilih minimal satu anggota");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      if (!newJenjang) {
        setError("Pilih jenjang baru");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      if (!tanggalDilantik) {
        setError("Tanggal dilantik wajib diisi");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Jika naik ke madya, langsung ke step 2 (konfirmasi)
      // Jika naik ke bhakti, perlu step pengisian pandega
      if (newJenjang === "bhakti") {
        setCurrentStep(2);
      } else {
        setCurrentStep(2); // Langsung ke konfirmasi untuk madya
      }
    }
    
    // Validasi step 2 (pengisian pandega)
    if (currentStep === 2 && newJenjang === "bhakti") {
      const missingPandega = selectedMembers.filter(member => 
        !pandegaData[member._id]?.trim()
      );
      
      if (missingPandega.length > 0) {
        setError(`Nama Pandega wajib diisi untuk ${missingPandega.length} anggota`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      setCurrentStep(3);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Update jenjang for selected members
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Update each member
      const updatePromises = selectedMembers.map((member) => {
        const updateData = {
          ...member,
          jenjang: newJenjang,
          tanggalDilantik: tanggalDilantik,
        };
        
        // Jika naik ke bhakti, tambahkan nama pandega
        if (newJenjang === "bhakti" && pandegaData[member._id]?.trim()) {
          updateData.pandega = pandegaData[member._id].trim();
        }
        
        return fetch(`${API_BASE_URL}/api/db/${member._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      });

      const responses = await Promise.all(updatePromises);
      const errors = [];

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorData = await responses[i].json();
          errors.push(`${selectedMembers[i].nama}: ${errorData.message}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Gagal update beberapa anggota: ${errors.join(", ")}`);
      }

      // Invalidate queries untuk refresh data
      await queryClient.invalidateQueries(["members", "admin"]);
      await queryClient.invalidateQueries(["members", "public"]);
      await queryClient.invalidateQueries(["members", "quickedit"]);

      setSuccessMessage(
        `✅ Berhasil mengupdate ${selectedMembers.length} anggota ke jenjang ${
          newJenjang === "madya" ? "Madya" : "Bhakti"
        }`
      );

      // Tunggu 2 detik, lalu redirect
      setTimeout(() => {
        onClose();
        navigate("/admin/database-anggota");
        if (onSuccess) {
          onSuccess(`${selectedMembers.length} anggota berhasil diupdate ke jenjang ${newJenjang === "madya" ? "Madya" : "Bhakti"}`);
        }
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Terjadi kesalahan saat update");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tentukan step titles berdasarkan newJenjang
  const getStepTitles = () => {
    const baseTitles = [
      { number: 1, title: "Pilih Anggota & Jenjang" },
      { number: 2, title: "Konfirmasi" }
    ];
    
    if (newJenjang === "bhakti") {
      return [
        { number: 1, title: "Pilih Anggota & Jenjang" },
        { number: 2, title: "Isi Nama Pandega" },
        { number: 3, title: "Konfirmasi" }
      ];
    }
    
    return baseTitles;
  };

  const steps = getStepTitles();
  const currentStepNumber = currentStep;
  const isConfirmStep = (newJenjang === "bhakti" && currentStep === 3) || 
                       (newJenjang === "madya" && currentStep === 2);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()} // Mencegah klik pada modal menutup
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Quick Edit Jenjang
                </h2>
                <p className="text-gray-600 mt-1">
                  Naikkan jenjang untuk beberapa anggota sekaligus
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-6 flex-shrink-0">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${
                        currentStepNumber === step.number
                          ? "bg-blue-600 border-blue-600 text-white"
                          : currentStepNumber > step.number
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}>
                        {currentStepNumber > step.number ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        currentStepNumber === step.number ? "text-blue-600" : "text-gray-500"
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        currentStepNumber > step.number ? "bg-green-500" : "bg-gray-300"
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Content - Fixed height container */}
          <div className="flex-1 overflow-hidden p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {currentStep === 1 && (
                  <StepOneSection
                    members={members}
                    isLoading={isLoading}
                    selectedMembers={selectedMembers}
                    setSelectedMembers={setSelectedMembers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    newJenjang={newJenjang}
                    setNewJenjang={setNewJenjang}
                    tanggalDilantik={tanggalDilantik}
                    setTanggalDilantik={setTanggalDilantik}
                    error={error}
                    setError={setError}
                  />
                )}

                {currentStep === 2 && newJenjang === "bhakti" && (
                  <StepTwoSection
                    selectedMembers={selectedMembers}
                    pandegaData={pandegaData}
                    setPandegaData={setPandegaData}
                    error={error}
                    setError={setError}
                  />
                )}

                {isConfirmStep && (
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Konfirmasi Perubahan
                    </h3>
                    
                    <div className="bg-gray-50 p-6 rounded-lg flex-1 overflow-y-auto border border-gray-200">
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Ringkasan Perubahan</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Jumlah Anggota</p>
                            <p className="text-xl font-bold text-gray-900">{selectedMembers.length} orang</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Jenjang Baru</p>
                            <p className={`text-xl font-bold ${
                              newJenjang === "madya" ? "text-red-700" : "text-yellow-700"
                            }`}>
                              {newJenjang === "madya" ? "Madya" : "Bhakti"}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Tanggal Dilantik</p>
                            <p className="text-xl font-bold text-gray-900">{tanggalDilantik}</p>
                          </div>
                          {newJenjang === "bhakti" && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-600 mb-1">Pandega Terisi</p>
                              <p className="text-xl font-bold text-gray-900">
                                {Object.keys(pandegaData).filter(id => pandegaData[id]?.trim()).length}/{selectedMembers.length}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Detail Anggota</h4>
                        <div className="space-y-3">
                          {selectedMembers.map((member) => (
                            <div key={member._id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-medium text-gray-900">{member.nama}</h5>
                                  <p className="text-sm text-gray-600">{member.nim} • {member.fakultas}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    member.jenjang === "muda"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {member.jenjang === "muda" ? "Muda" : "Madya"}
                                  </span>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    newJenjang === "madya"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {newJenjang === "madya" ? "Madya" : "Bhakti"}
                                  </span>
                                </div>
                              </div>
                              {newJenjang === "bhakti" && pandegaData[member._id] && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Pandega:</span> {pandegaData[member._id]}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error & Success Messages */}
          {(error || successMessage) && (
            <div className="px-6 pb-2 flex-shrink-0">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {successMessage}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Step {currentStepNumber} dari {steps.length} • {selectedMembers.length} anggota terpilih
                </p>
              </div>
              <div className="flex space-x-3">
                {currentStepNumber > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Kembali
                  </button>
                )}
                
                {!isConfirmStep ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow"
                  >
                    {currentStepNumber === 1 ? "Lanjut" : "Konfirmasi"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedMembers.length === 0 || !newJenjang || !tanggalDilantik || (newJenjang === "bhakti" && Object.keys(pandegaData).filter(id => pandegaData[id]?.trim()).length !== selectedMembers.length)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] transition-all shadow-sm hover:shadow"
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
                        Memproses...
                      </>
                    ) : (
                      "Update Jenjang"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickEdit;