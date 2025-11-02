import React from 'react';

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

interface ImageGridProps {
  images: Source[];
  searchQuery: string;
  isSearching?: boolean;
  error?: string | null;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, searchQuery, isSearching = false, error = null }) => {
  // Determine confidence color based on percentage
  // const getConfidenceColor = (confidence: number): string => {
  //   if (confidence >= 75) return 'bg-green-500';
  //   if (confidence >= 50) return 'bg-yellow-500';
  //   if (confidence >= 25) return 'bg-orange-500';
  //   return 'bg-red-500';
  // };

  return (
    <>
      {/* Results Count */}
      {!isSearching && (
        <div className="mb-4 text-gray-600">
          {searchQuery.trim() ? (
            images.length > 0 && (
              <span>Found <span className="font-semibold">{images.length}</span> results for "{searchQuery}"</span>
            )
          ) : (
            <span>Showing <span className="font-semibold">{images.length}</span> images</span>
          )}
        </div>
      )}

      {/* Error State */}
      {!isSearching && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 max-w-md">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && !error && searchQuery.trim() && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500 max-w-md">
            Try different keywords or check your spelling. Search for terms like "mars", "solar", "hubble", or "astronaut".
          </p>
        </div>
      )}

      {/* Image Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-200"
      >
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {image.image_url && (
              <img
                src={image.image_url}
                alt={image.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{image.name}</h2>

              <p className="text-gray-600 mb-2 line-clamp-3">{image.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                {image.launch_date && new Date(image.launch_date).toLocaleDateString()}
              </p>
              {image.image_url && (
                <a
                  href={image.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  View Full Image
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ImageGrid;
