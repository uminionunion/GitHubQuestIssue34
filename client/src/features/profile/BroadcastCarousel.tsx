import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
}

interface BroadcastCarouselProps {
  items?: BroadcastItem[];
}

const defaultBroadcasts: BroadcastItem[] = [
  {
    id: 1,
    title: "Visit our shop",
    imageUrl: "https://page001.uminion.com/wp-content/uploads/2025/12/[YOUR-SHOP-IMAGE].jpg",
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
    imageUrl: "https://[UKRAINE-IMAGE-URL].jpg",
    clickUrl: "https://u24.gov.ua/"
  },
  // Add more items (total of 30) following this pattern
  // Items 4-30 can be added later
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

      {/* Image Container */}
      <div className="flex gap-4 flex-1 justify-center">
        {currentItems.map((item) => (
          <a
            key={item.id}
            href={item.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            title={item.title}
          >
            <div className="h-32 w-32 rounded-md overflow-hidden bg-background">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                }}
              />
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

      {/* Page Indicator */}
      <div className="text-xs text-muted-foreground absolute bottom-2 right-4">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
};

export default BroadcastCarousel;
