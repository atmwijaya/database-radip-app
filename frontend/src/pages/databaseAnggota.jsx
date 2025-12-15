import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import SearchSection from "../components/databaseanggota/searchSection";
import FilterSection from "../components/databaseanggota/filterSection";
import ResultsSection from "../components/databaseanggota/resultSection";
import EmptyStateSection from "../components/databaseanggota/emptyStateSection";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchMembers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/db`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data anggota");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

const DatabaseAnggota = () => {
  // State utama
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // State untuk filter
  const [selectedAngkatan, setSelectedAngkatan] = useState([]);
  const [selectedFakultas, setSelectedFakultas] = useState([]);
  const [selectedJenjang, setSelectedJenjang] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // State untuk kontrol search behavior
  const [shouldSearch, setShouldSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch data dengan React Query
  const { data: members = [], isLoading, isError, error } = useQuery({
    queryKey: ["members", "public"],
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Ekstrak data unik untuk filter
  const { angkatanList, fakultasList } = useMemo(() => {
    if (!members || members.length === 0) {
      return { angkatanList: [], fakultasList: [] };
    }

    const angkatanSet = new Set();
    const fakultasSet = new Set();
    
    members.forEach(member => {
      if (member.angkatan) angkatanSet.add(member.angkatan);
      if (member.fakultas) fakultasSet.add(member.fakultas);
    });

    return {
      angkatanList: Array.from(angkatanSet).sort((a, b) => b - a),
      fakultasList: Array.from(fakultasSet).sort()
    };
  }, [members]);

  // Jenjang options
  const jenjangOptions = useMemo(() => {
    const jenjangSet = new Set();
    members.forEach(member => {
      if (member.jenjang) jenjangSet.add(member.jenjang);
    });
    
    const options = [];
    if (jenjangSet.has("muda")) options.push({ value: "muda", label: "Muda", color: "bg-green-100 text-green-800" });
    if (jenjangSet.has("madya")) options.push({ value: "madya", label: "Madya", color: "bg-red-100 text-red-800" });
    if (jenjangSet.has("bhakti")) options.push({ value: "bhakti", label: "Bhakti", color: "bg-yellow-100 text-yellow-800" });
    
    return options;
  }, [members]);

  // Fungsi untuk cek apakah search kosong
  const isSearchEmpty = useMemo(() => {
    return !searchQuery.trim() && 
           selectedAngkatan.length === 0 && 
           selectedFakultas.length === 0 && 
           selectedJenjang.length === 0;
  }, [searchQuery, selectedAngkatan, selectedFakultas, selectedJenjang]);

  // Fungsi search utama
  const performSearch = useCallback(() => {
    if (isSearchEmpty) {
      // Reset ke state awal jika search kosong
      setFilteredMembers([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setHasSearched(true);
    setIsSearching(true);

    setTimeout(() => {
      const filtered = members.filter((member) => {
        const matchesSearch = !searchQuery.trim() || 
          member.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.noInduk && member.noInduk.toLowerCase().includes(searchQuery.toLowerCase())) ||
          member.nim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.fakultas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.jurusan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.angkatan?.toString().includes(searchQuery) ||
          member.ttl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.pandega && member.pandega.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesAngkatan = selectedAngkatan.length === 0 || 
          selectedAngkatan.includes(member.angkatan?.toString());

        const matchesFakultas = selectedFakultas.length === 0 || 
          selectedFakultas.includes(member.fakultas);

        const matchesJenjang = selectedJenjang.length === 0 || 
          selectedJenjang.includes(member.jenjang);

        return matchesSearch && matchesAngkatan && matchesFakultas && matchesJenjang;
      });

      filtered.sort((a, b) => {
        const nameA = a.nama?.toLowerCase() || '';
        const nameB = b.nama?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      setFilteredMembers(filtered);
      setIsSearching(false);
    }, 300);
  }, [searchQuery, selectedAngkatan, selectedFakultas, selectedJenjang, members, isSearchEmpty]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setIsTyping(true);
    
    // Jika input dikosongkan, reset ke state awal
    if (!value.trim() && isSearchEmpty) {
      setShouldSearch(true); // Trigger untuk reset
    }
  }, [isSearchEmpty]);

  const handleSearchSubmit = useCallback(() => {
    setIsTyping(false);
    setShouldSearch(true);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchQuery(suggestion.nama);
    setIsTyping(false);
    setShouldSearch(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShouldSearch(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedAngkatan([]);
    setSelectedFakultas([]);
    setSelectedJenjang([]);
    
    // Jika ada search query atau sudah pernah search, trigger search
    if (searchQuery || hasSearched) {
      setShouldSearch(true);
    }
  }, [searchQuery, hasSearched]);

  const toggleFilter = useCallback((filterType, value) => {
    let updated = false;
    
    switch (filterType) {
      case 'angkatan':
        setSelectedAngkatan(prev => {
          updated = !prev.includes(value);
          return prev.includes(value) 
            ? prev.filter(v => v !== value) 
            : [...prev, value];
        });
        break;
      case 'fakultas':
        setSelectedFakultas(prev => {
          updated = !prev.includes(value);
          return prev.includes(value) 
            ? prev.filter(v => v !== value) 
            : [...prev, value];
        });
        break;
      case 'jenjang':
        setSelectedJenjang(prev => {
          updated = !prev.includes(value);
          return prev.includes(value) 
            ? prev.filter(v => v !== value) 
            : [...prev, value];
        });
        break;
    }
    
    if (updated) {
      setIsTyping(false);
      setShouldSearch(true);
    }
  }, []);

  const activeFilterCount = selectedAngkatan.length + selectedFakultas.length + selectedJenjang.length;

  // Effect untuk trigger search
  useEffect(() => {
    if (shouldSearch) {
      performSearch();
      setShouldSearch(false);
    }
  }, [shouldSearch, performSearch]);

  // Effect untuk auto-reset ketika search kosong
  useEffect(() => {
    if (isSearchEmpty && hasSearched) {
      setHasSearched(false);
      setFilteredMembers([]);
    }
  }, [isSearchEmpty, hasSearched]);

  // Tentukan state yang sedang aktif
  const showEmptyState = !hasSearched && !isSearching && !searchQuery && activeFilterCount === 0;
  const showResults = hasSearched && !isSearching;
  const showLoading = isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col">
        <div className="mx-auto px-4 sm:px-6 py-8 w-full max-w-7xl">
          {/* Section 1: Header dan Search */}
          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            onSuggestionSelect={handleSuggestionSelect}
            onClearSearch={handleClearSearch}
            isSearching={isSearching}
            members={members}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFilterCount={activeFilterCount}
          />

          {/* Section 2: Filters */}
          <FilterSection
            showFilters={showFilters}
            selectedAngkatan={selectedAngkatan}
            selectedFakultas={selectedFakultas}
            selectedJenjang={selectedJenjang}
            angkatanList={angkatanList}
            fakultasList={fakultasList}
            jenjangOptions={jenjangOptions}
            onToggleFilter={toggleFilter}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
            onCloseFilters={() => setShowFilters(false)}
          />
        </div>

        {/* Section 3: Results - Full Width */}
        {showResults ? (
          <div className="flex-grow bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 py-6 w-full max-w-7xl">
              <ResultsSection
                filteredMembers={filteredMembers}
                searchQuery={searchQuery}
                activeFilterCount={activeFilterCount}
                onClearSearch={handleClearSearch}
                onClearFilters={handleClearFilters}
                isSearching={isSearching}
              />
            </div>
          </div>
        ) : showLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data anggota...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg animate-fadeIn max-w-2xl mx-4">
              <div className="flex items-center">
                <span className="text-lg mr-2">❌</span>
                <div>
                  <p className="font-medium">Gagal mengambil data</p>
                  <p className="text-sm mt-1">{error?.message || "Terjadi kesalahan saat mengambil data anggota"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="flex-grow flex items-center justify-center">
            <EmptyStateSection 
              searchQuery={searchQuery}
              activeFilterCount={activeFilterCount}
            />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default DatabaseAnggota;