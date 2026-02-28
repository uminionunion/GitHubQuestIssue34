import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description?: string;
}

interface BroadcastCarouselZoomModalProps {
  imageUrl: string;
  title: string;
  items: BroadcastItem[];
  currentIndex: number;
  onClose: () => void;
}

const BroadcastCarouselZoomModal: React.FC<BroadcastCarouselZoomModalProps> = ({
  imageUrl: initialImageUrl,
  title: initialTitle,
  items,
  currentIndex: initialIndex,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = items[currentIndex];
  const imageUrl = currentItem?.imageUrl || initialImageUrl;
  const title = currentItem?.title || initialTitle;

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999999] !z-[999999] flex items-center justify-center bg-black/70 pointer-events-auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Zoomed broadcast image viewer"
    >
      <div className="relative bg-black rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto z-[9999999] !z-[9999999] flex flex-col items-center gap-4">
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:bg-gray-700"
          title="Close (ESC)"
          aria-label="Close zoom"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Main Image */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto rounded max-h-[70vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Title & Counter */}
        <div className="text-center w-full">
          <p className="text-white text-sm font-semibold">{title}</p>
          <p className="text-gray-400 text-xs mt-1">
            Image {currentIndex + 1} of {items.length}
          </p>
        </div>

        {/* Navigation Arrows - Only if multiple images */}
        {items.length > 1 && (
          <div className="flex gap-4 justify-center w-full">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
              title="Previous image (← Arrow)"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Right Arrow */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
              title="Next image (→ Arrow)"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Keyboard Hints */}
        <p className="text-gray-500 text-xs text-center mt-2">
          Use ← → arrows or click buttons to navigate • ESC to close
        </p>
      </div>
    </div>
  );
};

export default BroadcastCarouselZoomModal;
