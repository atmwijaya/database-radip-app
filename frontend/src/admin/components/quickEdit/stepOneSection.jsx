import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";

const StepOneSection = ({
  members,
  isLoading,
  selectedMembers,
  setSelectedMembers,
  searchTerm,
  setSearchTerm,
  newJenjang,
  setNewJenjang,
  tanggalDilantik,
  setTanggalDilantik,
  error,
  setError,
}) => {
  const membersListRef = useRef(null);

  // Filter members berdasarkan search term (nama, NIM, atau angkatan)
  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.angkatan?.toString().includes(searchTerm)
      );
    }

    // Hanya filter berdasarkan newJenjang jika newJenjang sudah dipilih
    if (newJenjang) {
      filtered = filtered.filter((member) => {
        if (newJenjang === "madya") {
          return member.jenjang === "muda";
        } else if (newJenjang === "bhakti") {
          return member.jenjang === "madya";
        }
        return false;
      });
    }

    return filtered;
  }, [members, searchTerm, newJenjang]);

  // Tampilkan semua anggota jika tidak ada newJenjang yang dipilih
  const displayMembers = useMemo(() => {
    return filteredMembers;
  }, [filteredMembers]);

  // Urutkan: selected members dulu, baru filtered members
  const sortedMembers = useMemo(() => {
    const selectedIds = new Set(selectedMembers.map((m) => m._id));

    return [...displayMembers].sort((a, b) => {
      const aSelected = selectedIds.has(a._id);
      const bSelected = selectedIds.has(b._id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.nama?.localeCompare(b.nama);
    });
  }, [displayMembers, selectedMembers]);

  // Cek apakah ada anggota dengan jenjang yang berbeda (muda dan madya bersamaan)
  const hasMixedJenjang = useMemo(() => {
    const uniqueJenjang = new Set(selectedMembers.map((m) => m.jenjang));
    return uniqueJenjang.size > 1;
  }, [selectedMembers]);

  // Toggle selection dengan validasi jenjang
  const toggleMemberSelection = (member) => {
    // Validasi: tidak boleh memilih muda dan madya bersamaan
    const currentJenjangs = new Set(selectedMembers.map((m) => m.jenjang));
    if (currentJenjangs.size > 0 && !currentJenjangs.has(member.jenjang)) {
      setError("Tidak bisa memilih anggota dengan jenjang berbeda bersamaan");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Jika sudah ada newJenjang, validasi jenjang untuk naik jenjang
    if (newJenjang && newJenjang === "madya" && member.jenjang !== "muda") {
      setError(
        `Anggota ${member.nama} harus memiliki jenjang Muda untuk naik ke Madya`
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (newJenjang && newJenjang === "bhakti" && member.jenjang !== "madya") {
      setError(
        `Anggota ${member.nama} harus memiliki jenjang Madya untuk naik ke Bhakti`
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSelectedMembers((prev) => {
      const exists = prev.some((m) => m._id === member._id);
      if (exists) {
        return prev.filter((m) => m._id !== member._id);
      } else {
        return [...prev, member];
      }
    });

    // Clear error when selection changes
    setError(null);
  };

  // Select all filtered members
  const selectAllFiltered = () => {
    const filteredIds = displayMembers.map((m) => m._id);
    const currentSelectedIds = selectedMembers.map((m) => m._id);

    // Jika sudah ada newJenjang, filter anggota yang eligible
    let eligibleFilteredMembers = displayMembers;
    if (newJenjang) {
      eligibleFilteredMembers = displayMembers.filter((member) => {
        if (newJenjang === "madya") {
          return member.jenjang === "muda";
        } else if (newJenjang === "bhakti") {
          return member.jenjang === "madya";
        }
        return true;
      });
    }

    const eligibleFilteredIds = eligibleFilteredMembers.map((m) => m._id);

    // Validasi: cek apakah filtered members memiliki jenjang yang sama
    const filteredJenjangs = new Set(
      eligibleFilteredMembers.map((m) => m.jenjang)
    );
    const selectedJenjangs = new Set(selectedMembers.map((m) => m.jenjang));

    if (filteredJenjangs.size > 1 && selectedJenjangs.size === 0) {
      setError(
        "Tidak bisa memilih semua: terdapat anggota dengan jenjang berbeda"
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    // If all eligible filtered are already selected, deselect them
    const allFilteredSelected = eligibleFilteredIds.every((id) =>
      currentSelectedIds.includes(id)
    );

    if (allFilteredSelected) {
      setSelectedMembers((prev) =>
        prev.filter((m) => !eligibleFilteredIds.includes(m._id))
      );
    } else {
      // Add eligible filtered members that aren't already selected
      const membersToAdd = eligibleFilteredMembers.filter(
        (m) => !currentSelectedIds.includes(m._id)
      );
      setSelectedMembers((prev) => [...prev, ...membersToAdd]);
    }

    // Scroll to top of list
    if (membersListRef.current) {
      membersListRef.current.scrollTop = 0;
    }
  };

  // Reset semua ke idle state
  const resetToIdle = () => {
    setSelectedMembers([]);
    setNewJenjang("");
    setSearchTerm("");
    setError(null);
  };

  // Get current jenjang distribution
  const getJenjangStats = () => {
    const stats = { muda: 0, madya: 0, bhakti: 0 };
    selectedMembers.forEach((member) => {
      if (member.jenjang && stats[member.jenjang] !== undefined) {
        stats[member.jenjang]++;
      }
    });
    return stats;
  };

  const jenjangStats = getJenjangStats();

  // Jenjang options - tampilkan semua opsi dalam kondisi idle
  const getAvailableJenjangOptions = () => {
    const options = [
      {
        value: "madya",
        label: "Madya",
        description: "Muda → Madya",
        fromJenjang: "muda",
        toJenjang: "madya",
        color: "red",
      },
      {
        value: "bhakti",
        label: "Bhakti",
        description: "Madya → Bhakti",
        fromJenjang: "madya",
        toJenjang: "bhakti",
        color: "yellow",
      },
    ];

    return options;
  };

  const jenjangOptions = getAvailableJenjangOptions();

  // Reset newJenjang jika selected members kosong
  const handleSelectedMembersChange = (newSelected) => {
    setSelectedMembers(newSelected);
    if (newSelected.length === 0) {
      setNewJenjang("");
    }
  };

  // Handle jenjang selection
  const handleJenjangSelection = (option) => {
    setNewJenjang(option.value);

    // Jika sudah ada anggota terpilih, filter yang eligible
    if (selectedMembers.length > 0) {
      const eligibleMembers = selectedMembers.filter(
        (member) => member.jenjang === option.fromJenjang
      );

      // Jika ada anggota yang tidak eligible, tampilkan warning
      if (eligibleMembers.length !== selectedMembers.length) {
        const ineligibleCount = selectedMembers.length - eligibleMembers.length;
        setError(
          `${ineligibleCount} anggota tidak eligible untuk naik ke ${option.label}. Mereka akan dihapus dari selection.`
        );
        setTimeout(() => setError(null), 3000);
      }

      handleSelectedMembersChange(eligibleMembers);
    }
  };

  // Cek apakah anggota eligible berdasarkan jenjang yang dipilih
  const isMemberEligible = (member) => {
    if (!newJenjang) return true;

    const selectedOption = jenjangOptions.find(
      (opt) => opt.value === newJenjang
    );
    if (!selectedOption) return true;

    return member.jenjang === selectedOption.fromJenjang;
  };

  // Cek apakah ada anggota dengan jenjang yang sesuai untuk opsi tertentu
  const hasEligibleMembersForOption = (option) => {
    if (!members || members.length === 0) return false;

    return members.some((member) => member.jenjang === option.fromJenjang);
  };

  // Get button styling based on state
  const getButtonStyle = (option, isSelected) => {
    if (isSelected) {
      return option.color === "red"
        ? "border-red-500 bg-red-50"
        : "border-yellow-500 bg-yellow-50";
    }

    const hasEligible = hasEligibleMembersForOption(option);

    if (!hasEligible) {
      return "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50";
    }

    return "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
  };

  // Get text color based on state
  const getTextColor = (option, isSelected) => {
    if (isSelected) {
      return option.color === "red" ? "text-red-700" : "text-yellow-700";
    }

    const hasEligible = hasEligibleMembersForOption(option);

    if (!hasEligible) {
      return "text-gray-500";
    }

    return option.color === "red" ? "text-red-600" : "text-yellow-600";
  };

  // Cek apakah dalam state idle (tidak ada yang dipilih)
  const isIdleState =
    !newJenjang && selectedMembers.length === 0 && !searchTerm;

  return (
    <div className="grid grid-cols-2 h-full divide-x divide-gray-200 flex-1">
      {/* Left Panel - Member Selection */}
      <div className="pr-6 overflow-hidden flex flex-col h-full">
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pilih Anggota
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedMembers.length} terpilih
              </span>
              {!isIdleState && (
                <button
                  onClick={resetToIdle}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset
                </button>
              )}
              <button
                onClick={selectAllFiltered}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {displayMembers.length > 0 &&
                displayMembers.every(
                  (m) =>
                    selectedMembers.some((s) => s._id === m._id) &&
                    isMemberEligible(m)
                )
                  ? "Batal pilih semua"
                  : "Pilih semua eligible"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Cari nama, NIM, atau angkatan..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Info about filtering */}
          {newJenjang && !isIdleState && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                Menampilkan anggota dengan jenjang{" "}
                <span className="font-medium">
                  {newJenjang === "madya" ? "Muda" : "Madya"}
                </span>{" "}
                untuk dinaikkan ke{" "}
                <span className="font-medium">
                  {newJenjang === "madya" ? "Madya" : "Bhakti"}
                </span>
              </p>
            </div>
          )}

          {/* Current Jenjang Stats */}
          {selectedMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 bg-blue-50 rounded-lg"
            >
              <p className="text-sm text-gray-700 mb-2">
                Jenjang saat ini untuk {selectedMembers.length} anggota
                terpilih:
              </p>
              <div className="flex flex-wrap gap-2">
                {jenjangStats.muda > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Muda: {jenjangStats.muda}
                  </span>
                )}
                {jenjangStats.madya > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Madya: {jenjangStats.madya}
                  </span>
                )}
                {jenjangStats.bhakti > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Bhakti: {jenjangStats.bhakti}
                  </span>
                )}
              </div>

              {/* Warning for mixed jenjang */}
              {hasMixedJenjang && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  ⚠️ Tidak bisa memilih anggota dengan jenjang berbeda bersamaan
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Members List - Scrollable area */}
        <div
          ref={membersListRef}
          className="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-0"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data anggota...</p>
              </div>
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "Tidak ada anggota yang cocok dengan pencarian"
                  : newJenjang
                  ? `Tidak ada anggota dengan jenjang ${
                      newJenjang === "madya" ? "Muda" : "Madya"
                    }`
                  : "Gunakan search untuk mencari anggota"}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedMembers.map((member) => {
                const isSelected = selectedMembers.some(
                  (m) => m._id === member._id
                );
                const isEligible = isMemberEligible(member);

                return (
                  <div
                    key={member._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    } ${
                      !isEligible && newJenjang
                        ? "opacity-50 cursor-not-allowed hover:bg-white"
                        : ""
                    }`}
                    onClick={() => isEligible && toggleMemberSelection(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : !isEligible && newJenjang
                              ? "border-gray-300 bg-gray-100"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {!isEligible && newJenjang && !isSelected && (
                            <span className="text-xs text-gray-400">!</span>
                          )}
                        </div>
                        <div
                          className={`${
                            !isEligible && newJenjang ? "text-gray-400" : ""
                          }`}
                        >
                          <h4 className="font-medium">{member.nama}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm">{member.fakultas}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                member.jenjang === "muda"
                                  ? "bg-green-100 text-green-800"
                                  : member.jenjang === "madya"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {member.jenjang === "muda"
                                ? "Muda"
                                : member.jenjang === "madya"
                                ? "Madya"
                                : "Bhakti"}
                            </span>
                            <span className="text-xs text-gray-500">
                              • Angkatan {member.angkatan}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm ${
                            !isEligible && newJenjang
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {member.nim}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isSelected ? "✓ Terpilih" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Jenjang Selection */}
      <div className="pl-6 overflow-hidden flex flex-col h-full">
        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Konfigurasi Jenjang Baru
          </h3>

          {/* Jenjang Selection - Always show both options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Jenjang Baru <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {jenjangOptions.map((option) => {
                const isSelected = newJenjang === option.value;
                const hasEligible = hasEligibleMembersForOption(option);
                const buttonStyle = getButtonStyle(option, isSelected);
                const textColor = getTextColor(option, isSelected);
                const isDisabled = !hasEligible;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      !isDisabled && handleJenjangSelection(option)
                    }
                    disabled={isDisabled}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${buttonStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-lg font-bold mb-1 ${textColor}`}>
                          {option.label}
                        </div>
                        <p
                          className={`text-sm ${
                            isDisabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {option.description}
                        </p>
                        {!hasEligible && (
                          <p className="text-xs text-gray-400 mt-1">
                            Tidak ada anggota dengan jenjang{" "}
                            {option.fromJenjang === "muda" ? "Muda" : "Madya"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {isDisabled && (
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanggal Dilantik */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Dilantik <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={tanggalDilantik}
                onChange={(e) => setTanggalDilantik(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const formattedDate = today.toISOString().split("T")[0];
                  setTanggalDilantik(formattedDate);
                }}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Hari Ini
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tanggal ketika anggota dilantik ke jenjang baru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOneSection;
