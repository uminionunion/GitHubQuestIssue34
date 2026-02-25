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
}

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({ 
  items = [], 
  isAdmin = false,
  onReorderLeft,
  onReorderRight
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReordering, setIsReordering] = useState(false);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1));
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

      {/* Images with Admin Controls */}
      <div className="flex gap-4 flex-1 justify-center">
        {currentItems.map((item, index) => (
          <a
            key={item.id}
            href={item.clickUrl || '#'}
            target={item.clickUrl ? '_blank' : undefined}
            rel={item.clickUrl ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (!item.clickUrl) e.preventDefault();
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity relative group"
            title={item.title}
          >
            <div className="h-32 w-32 rounded-md overflow-hidden bg-background border relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                }}
              />
              
              {/* Admin Overlay Controls - Only visible to admins */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-between px-2 opacity-0 group-hover:opacity-100">
                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderLeft(item, index);
                    }}
                    disabled={isReordering}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderRight(item, index);
                    }}
                    disabled={isReordering}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </a>
        ))}
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
  );
};

export default BroadcastCarousel;
