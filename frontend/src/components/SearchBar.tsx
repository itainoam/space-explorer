import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, isSearching }) => {
  return (
    <div className="mb-6 relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="🔍 Search for images... (try 'mars', 'solar', 'hubble')"
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
      />
      {isSearching && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
