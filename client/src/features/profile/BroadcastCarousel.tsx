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
  // TEMPLATE FOR ITEMS 4-30:
  // {
  //   id: 4,
  //   title: "Your Title",
  //   imageUrl: "https://your-image-url.jpg",
  //   clickUrl: "https://your-click-url.com/"
  // },
];

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({ items = defaultBroadcasts }) => {
  const [currentPage, setCurrentPage] = useState(0);
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

  const currentItems = getCurrentItems();

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

      {/* Images */}
      <div className="flex gap-4 flex-1 justify-center">
        {currentItems.map((item) => {
          const hasUrl = item.clickUrl && item.clickUrl.trim() !== '';
          const content = (
            <div className="h-32 w-32 rounded-md overflow-hidden bg-background border flex flex-col">
              <img
                src={item.imageUrl}
                alt={item.title || 'Broadcast image'}
                className="h-24 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                }}
              />
              <div className="flex-1 p-1 flex flex-col justify-between bg-gray-900">
                {item.title && (
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-300 line-clamp-1">{item.description}</p>
                )}
              </div>
            </div>
          );

          if (hasUrl) {
            return (
              <a
                key={item.id}
                href={item.clickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                title={item.title}
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={item.id}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title={item.title}
            >
              {content}
            </div>
          );
        })}
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

      {/* Page Indicator */}
      <div className="text-xs text-muted-foreground absolute bottom-2 right-4">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
};

export default BroadcastCarousel;
