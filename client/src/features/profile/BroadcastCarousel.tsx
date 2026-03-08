import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description?: string;
}

interface BroadcastCarouselProps {
  items?: BroadcastItem[];
  isAdmin?: boolean;
  onReorderLeft?: (itemId: number) => Promise<void>;
  onReorderRight?: (itemId: number) => Promise<void>;
  onImageZoom?: (imageUrl: string, title: string, items: BroadcastItem[], currentIndex: number) => void;
}

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({ 
  items = [], 
  isAdmin = false,
  onReorderLeft,
  onReorderRight,
  onImageZoom
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReordering, setIsReordering] = useState(false);
  const itemsPerPage = 3;
  
  // FIX: Calculate totalPages correctly
  // If items.length = 0, totalPages = 0
  // If items.length = 1-3, totalPages = 1
  // If items.length = 4-6, totalPages = 2
  // etc.
  const totalPages = items.length === 0 ? 0 : Math.ceil(items.length / itemsPerPage);

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const handlePrevious = () => {
    console.log(`[CAROUSEL] handlePrevious clicked: currentPage=${currentPage}, totalPages=${totalPages}`);
    if (totalPages <= 1) {
      console.log('[CAROUSEL] Cannot paginate - only 1 page or less');
      return;
    }
    setCurrentPage(prev => {
      const newPage = prev === 0 ? totalPages - 1 : prev - 1;
      console.log(`[CAROUSEL] Page changed: ${prev} → ${newPage}`);
      return newPage;
    });
  };

  const handleNext = () => {
    console.log(`[CAROUSEL] handleNext clicked: currentPage=${currentPage}, totalPages=${totalPages}`);
    if (totalPages <= 1) {
      console.log('[CAROUSEL] Cannot paginate - only 1 page or less');
      return;
    }
    setCurrentPage(prev => {
      const newPage = prev === totalPages - 1 ? 0 : prev + 1;
      console.log(`[CAROUSEL] Page changed: ${prev} → ${newPage}`);
      return newPage;
    });
  };

  const handleReorderLeft = async (item: BroadcastItem, index: number) => {
    if (!onReorderLeft || isReordering) return;
    
    setIsReordering(true);
    try {
      await onReorderLeft(item.id);
      console.log('[CAROUSEL] Reordered left:', item.id);
    } catch (error) {
      console.error('[CAROUSEL] Error reordering:', error);
      alert('Failed to reorder image');
    } finally {
      setIsReordering(false);
    }
  };

  const handleReorderRight = async (item: BroadcastItem, index: number) => {
    if (!onReorderRight || isReordering) return;
    
    setIsReordering(true);
    try {
      await onReorderRight(item.id);
      console.log('[CAROUSEL] Reordered right:', item.id);
    } catch (error) {
      console.error('[CAROUSEL] Error reordering:', error);
      alert('Failed to reorder image');
    } finally {
      setIsReordering(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent, item: BroadcastItem) => {
    if (item.clickUrl) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onImageZoom) {
      const currentIndex = items.findIndex(i => i.id === item.id);
      console.log('[CAROUSEL] Image clicked for zoom:', item.title, 'Index:', currentIndex);
      onImageZoom(item.imageUrl, item.title, items, currentIndex);
    }
  };

  const currentItems = getCurrentItems();

  // If no items, show empty state
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg h-48">
        <div className="text-center text-muted-foreground">
          No images yet. Add images to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 p-4 bg-muted rounded-lg">
      {/* Left Arrow - DISABLED if only 1 page */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={totalPages <= 1}
        className="h-10 w-10 md:h-8 md:w-8 flex-shrink-0"
        type="button"
      >
        <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
      </Button>

      {/* Images with Admin Controls */}
      <div className="flex gap-2 md:gap-4 flex-1 justify-center min-w-0">
        {currentItems.map((item, index) => (
          <div
            key={item.id}
            className="cursor-pointer hover:opacity-80 transition-opacity relative group flex-shrink-0"
            title={item.title}
          >
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-md overflow-hidden bg-background border relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover cursor-pointer"
                onClick={(e) => handleImageClick(e, item)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                }}
              />
              
              {/* Admin Overlay Controls */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-between px-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderLeft(item, index);
                    }}
                    disabled={isReordering}
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderRight(item, index);
                    }}
                    disabled={isReordering}
                    type="button"
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {item.clickUrl && (
              <a
                href={item.clickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 rounded-md"
                title="Open external link"
              />
            )}
          </div>
        ))}
      </div>

      {/* Right Arrow - DISABLED if only 1 page */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={totalPages <= 1}
        className="h-10 w-10 md:h-8 md:w-8 flex-shrink-0"
        type="button"
      >
        <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
      </Button>
    </div>
  );
};

export default BroadcastCarousel;
