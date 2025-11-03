import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onSearch, onClear, isSearching }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for images... (try 'mars', 'solar', 'hubble')"
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 p-1 rounded-full"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        disabled={isSearching}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
      >
        {isSearching ? (
          <div className="flex items-center gap-2 justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            <span>Searching...</span>
          </div>
        ) : (
          'Search'
        )}
      </button>
    </div>
  );
};

export default SearchBar;
