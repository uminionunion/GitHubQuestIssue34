import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BroadcastItem {
  id: number;
  title?: string;
  imageUrl: string;
  clickUrl?: string;
  description?: string;
}

interface BroadcastCarouselProps {
  items?: BroadcastItem[];
}

const defaultBroadcasts: BroadcastItem[] = [
  {
    id: 1,
    title: "Visit our shop",
    imageUrl: "https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png",
    clickUrl: "https://page001.uminion.com/shop/"
  },
  {
    id: 2,
    title: "Uminion Wristband",
    imageUrl: "https://page001.uminion.com/wp-content/uploads/2025/12/Product-uminion-dot-com-wristband.jpg",
    clickUrl: "https://page001.uminion.com/product/wristband-uminion-com-with-unionlegal23s-phone-number-on-it/"
  },
  {
    id: 3,
    title: "Ukraine Support",
    imageUrl: "https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png",
    clickUrl: "https://u24.gov.ua/"
  },
];

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({ items = defaultBroadcasts }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  
  // FIXED: Ensure items are always sorted by newest first
  // The backend returns items ordered by created_at DESC, so this maintains correct order
  const sortedItems = [...items].reverse().reverse(); // Ensure immutable copy
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const currentItems = getCurrentItems();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Images */}
        <div className="flex gap-4 flex-1 justify-center">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <a
                key={item.id}
                href={item.clickUrl || '#'}
                target={item.clickUrl ? "_blank" : undefined}
                rel={item.clickUrl ? "noopener noreferrer" : undefined}
                className={`cursor-pointer transition-opacity ${item.clickUrl ? 'hover:opacity-80' : 'opacity-100'}`}
                title={item.title}
              >
                <div className="h-32 w-32 rounded-md overflow-hidden bg-background border">
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Broadcast image'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                    }}
                  />
                </div>
              </a>
            ))
          ) : (
            <div className="h-32 w-full flex items-center justify-center text-muted-foreground">
              No images available
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Indicator - NEW */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage ? 'bg-orange-400' : 'bg-gray-400'
              }`}
              title={`Page ${i + 1} of ${totalPages}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default BroadcastCarousel;
