import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import SearchBar from './SearchBar';
import ImageGrid from './ImageGrid';

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
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all images on mount
  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const response = await axios.get('/api/sources');
        setAllImages(response.data);
        setDisplayedImages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch space images');
        setLoading(false);
      }
    };

    fetchAllImages();
  }, []);

  // Search effect using debounced query
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      // Empty search - show all images
      setDisplayedImages(allImages);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const response = await axios.post('/api/search', { query: debouncedSearchQuery });
        // Show search results (even if empty - don't fallback to all images)
        setDisplayedImages(response.data.results);
        setIsSearching(false);
      } catch (err) {
        setError('Search failed');
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, allImages]);

  // Update searching state when user is typing
  useEffect(() => {
    if (searchQuery.trim() && searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }
  }, [searchQuery, debouncedSearchQuery]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NASA Space Images</h1>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearching}
      />

      <ImageGrid
        images={displayedImages}
        searchQuery={searchQuery}
        isSearching={isSearching}
      />
    </div>
  );
};

export default Sources; 
