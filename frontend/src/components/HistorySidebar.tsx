import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';

interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  results_count: number;
  top_result: {
    name: string;
    confidence: number;
    image_url: string;
  } | null;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSelect: (query: string) => void;
}

export interface HistorySidebarRef {
  refreshHistory: () => void;
}

const HistorySidebar = forwardRef<HistorySidebarRef, HistorySidebarProps>(
  ({ isOpen, onClose, onSearchSelect }, ref) => {
    const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [total, setTotal] = useState(0);

    const fetchHistory = async (pageNum: number = page) => {
      // Only show loading spinner on initial load
      if (history.length === 0) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await axios.get('/api/history', {
          params: { page: pageNum, page_size: pageSize }
        });
        setHistory(response.data.entries);
        setTotal(response.data.total);
        setPage(pageNum);
        setLoading(false);
      } catch (err) {
        setError('Failed to load history');
        setLoading(false);
      }
    };

    // Expose refreshHistory method to parent
    useImperativeHandle(ref, () => ({
      refreshHistory: () => {
        if (isOpen) {
          fetchHistory(page);
        }
      }
    }));

    useEffect(() => {
      if (isOpen) {
        fetchHistory(1);
      }
    }, [isOpen]);

    const handleDelete = async (id: string) => {
      try {
        await axios.delete(`/api/history/${id}`);

        // If we just deleted the last item on current page, go to previous page
        if (history.length === 1 && page > 1) {
          fetchHistory(page - 1);
        } else {
          fetchHistory(page);
        }
      } catch (err) {
        alert('Failed to delete entry. Please try again.');
      }
    };

    // Format timestamp with relative time
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      const isCurrentYear = date.getFullYear() === now.getFullYear();
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        ...(isCurrentYear ? {} : { year: 'numeric' })
      };
      return date.toLocaleDateString(undefined, options);
    };

    // Get full timestamp for tooltip
    const getFullTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
      <>
        {/* Backdrop - Click to close (mobile) */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Search History</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            {loading && (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center p-4">{error}</div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className="text-center text-gray-500 p-8">
                <p className="text-lg mb-2">No search history yet</p>
                <p className="text-sm">Try searching for images</p>
              </div>
            )}

            {/* History List */}
            {!loading && history.length > 0 && (
              <div className="flex-1 overflow-y-auto pb-24">
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index !== history.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {/* Query - clickable */}
                    <button
                      onClick={() => onSearchSelect(entry.query)}
                      className="flex-1 text-left truncate hover:text-blue-600 transition-colors"
                      title={entry.query}
                    >
                      <span className="font-medium text-gray-800">
                        {entry.query || '(empty search)'}
                      </span>
                    </button>

                    {/* Time */}
                    <span
                      className="text-xs text-gray-500 whitespace-nowrap"
                      title={getFullTimestamp(entry.timestamp)}
                    >
                      {formatTimestamp(entry.timestamp)}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="p-4 border-t bg-white absolute bottom-0 left-0 right-0">
                <div className="flex items-center justify-between text-sm mb-2">
                  <button
                    onClick={() => fetchHistory(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  <span className="text-gray-600 font-medium">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => fetchHistory(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <div className="text-center text-gray-500 text-xs">
                  {total} total search{total !== 1 ? 'es' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

HistorySidebar.displayName = 'HistorySidebar';

export default HistorySidebar;
