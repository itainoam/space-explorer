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
  return (
    <>
      {/* Results Count */}
      {!isSearching && (
        <div className="mb-6 text-gray-600 text-lg">
          {searchQuery.trim() ? (
            images.length > 0 && (
              <span>Found <span className="font-bold text-blue-600">{images.length}</span> results for "<span className="font-semibold">{searchQuery}</span>"</span>
            )
          ) : (
            <span>Showing <span className="font-bold text-blue-600">{images.length}</span> images</span>
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
      {!isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-200">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
              {image.image_url && (
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Confidence score if available */}
                  {image.confidence !== undefined && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      {image.confidence}% match
                    </div>
                  )}
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">{image.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-grow">{image.description}</p>
                {image.image_url && (
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <a
                      href={image.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg shadow-md"
                    >
                      View Full Image
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ImageGrid;
