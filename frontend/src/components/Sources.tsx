import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import ImageGrid from './ImageGrid';
import HistorySidebar, { HistorySidebarRef } from './HistorySidebar';

interface Source {
  id: number;
  name: string;
  description: string;
  launch_date: string;
  image_url: string;
  type: string;
  status: string;
  confidence?: number;
}

const Sources: React.FC = () => {
  const [allImages, setAllImages] = useState<Source[]>([]);
  const [displayedImages, setDisplayedImages] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const searchAbortController = useRef<AbortController | null>(null);
  const historySidebarRef = useRef<HistorySidebarRef>(null);

  // Fetch all images on mount
  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const response = await axios.get('/api/sources');
        setAllImages(response.data);
        setDisplayedImages(response.data);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to fetch space images');
        setLoading(false);
        // Still show the app structure, just with error message
        setAllImages([]);
        setDisplayedImages([]);
      }
    };

    fetchAllImages();
  }, []);

  // Handle clear search
  const handleClear = () => {
    setSearchQuery('');
    setLastSearchedQuery('');
    setDisplayedImages(allImages);
    setError(null);
  };

  // Handle explicit search (button click or Enter key)
  const handleSearch = async () => {
    // If query is empty, just show all images without hitting API
    if (!searchQuery.trim()) {
      setDisplayedImages(allImages);
      setLastSearchedQuery('');
      setError(null);
      return;
    }

    // Cancel previous search if still running
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    // Create new abort controller for this search
    searchAbortController.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      const response = await axios.post(
        '/api/search',
        { query: searchQuery },
        { signal: searchAbortController.current.signal }
      );

      setDisplayedImages(response.data.results);
      setLastSearchedQuery(searchQuery);
      setIsSearching(false);
      setError(null);

      // Refresh history sidebar if it's open
      if (isHistoryOpen && historySidebarRef.current) {
        historySidebarRef.current.refreshHistory();
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        // Request was cancelled, ignore
        return;
      }

      // Extract meaningful error message
      let errorMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          const status = err.response.status;
          if (err.response.data?.detail) {
            errorMessage = `${err.response.data.detail} (Error ${status})`;
          } else {
            errorMessage = `Unable to complete your request. (Error ${status})`;
          }
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Unable to reach the server. Please check your connection.';
        }
      }

      setError(errorMessage);
      setDisplayedImages([]); // Clear stale results
      setIsSearching(false);
    }
  };

  // Handle search from history sidebar
  const handleHistorySearch = (query: string) => {
    setSearchQuery(query);
    // Trigger search with the selected query
    // We need to call handleSearch after state updates, so we'll use a different approach
    // Set the query and let the effect handle it
    setTimeout(() => {
      // Create a synthetic search
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }

      searchAbortController.current = new AbortController();
      setIsSearching(true);
      setError(null);

      axios.post(
        '/api/search',
        { query },
        { signal: searchAbortController.current.signal }
      ).then(response => {
        setDisplayedImages(response.data.results);
        setLastSearchedQuery(query);
        setIsSearching(false);
        setError(null);

        // Refresh history sidebar after search
        if (isHistoryOpen && historySidebarRef.current) {
          historySidebarRef.current.refreshHistory();
        }
      }).catch(err => {
        if (axios.isCancel(err)) {
          return;
        }

        // Extract meaningful error message
        let errorMessage = 'Something went wrong. Please try again.';
        if (axios.isAxiosError(err)) {
          if (err.response) {
            // Server responded with error
            const status = err.response.status;
            if (err.response.data?.detail) {
              errorMessage = `${err.response.data.detail} (Error ${status})`;
            } else {
              errorMessage = `Unable to complete your request. (Error ${status})`;
            }
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Unable to reach the server. Please check your connection.';
          }
        }

        setError(errorMessage);
        setDisplayedImages([]); // Clear stale results
        setIsSearching(false);
      });
    }, 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with History Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">NASA Space Images</h1>
        <button
          onClick={() => setIsHistoryOpen(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          History
        </button>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={isSearching}
      />

      <ImageGrid
        images={displayedImages}
        searchQuery={lastSearchedQuery}
        isSearching={isSearching}
        error={error}
      />

      {/* History Sidebar */}
      <HistorySidebar
        ref={historySidebarRef}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSearchSelect={handleHistorySearch}
      />
    </div>
  );
};

export default Sources; 
