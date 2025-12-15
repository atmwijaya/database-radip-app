import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, X, Filter, Loader2 } from "lucide-react";

const SearchSection = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSuggestionSelect,
  onClearSearch,
  isSearching,
  members,
  showFilters,
  onToggleFilters,
  activeFilterCount
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Update suggestions dengan debounce
  const updateSuggestions = useCallback((query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const matched = members
      .filter(member => {
        const searchFields = [
          member.nama,
          member.nim,
          member.angkatan?.toString(),
          member.fakultas,
          member.jurusan,
          member.noInduk
        ].filter(Boolean).map(field => field?.toLowerCase());

        return searchFields.some(field => field.includes(searchQuery));
      })
      .slice(0, 5)
      .map(member => ({
        id: member._id,
        nama: member.nama,
        nim: member.nim,
        angkatan: member.angkatan,
        displayText: `${member.nama} ${member.nim ? `(${member.nim})` : ''}`
      }));

    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
  }, [members]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Debounce untuk suggestions
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      updateSuggestions(value);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onSearchSubmit();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      updateSuggestions(searchQuery);
      setShowSuggestions(true);
    }
  };

  // Close suggestions ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-4 sm:mb-6">
        Cari Anggota
      </h1>

      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {/* Search Input dengan Suggestions */}
          <div className="relative flex-1" ref={suggestionsRef}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Ketik nama, NIM, angkatan, fakultas..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 pr-10 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-colors duration-200" />
            
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Auto-suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto animate-fadeIn">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                    Saran pencarian ({suggestions.length})
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between border-b border-gray-100 last:border-b-0 group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {suggestion.nama}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                          {suggestion.nim && (
                            <span>NIM: {suggestion.nim}</span>
                          )}
                          {suggestion.angkatan && (
                            <span>• Angkatan: {suggestion.angkatan}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-blue-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Klik untuk cari
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Search Button */}
            <button
              onClick={onSearchSubmit}
              disabled={isSearching}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Mencari...</span>
                  <span className="sm:hidden">Cari</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Cari</span>
                  <span className="sm:hidden">Cari</span>
                </>
              )}
            </button>

            {/* Filter Button */}
            <button
              onClick={onToggleFilters}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;