import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description?: string;
}

interface Comment {
  id: number;
  username: string;
  comment_text: string;
  created_at: string;
}

interface BroadcastCarouselZoomModalProps {
  imageUrl: string;
  title: string;
  items: BroadcastItem[];
  currentIndex: number;
  onClose: () => void;
  currentUser?: any;
}

const BroadcastCarouselZoomModal: React.FC<BroadcastCarouselZoomModalProps> = ({
  imageUrl: initialImageUrl,
  title: initialTitle,
  items,
  currentIndex: initialIndex,
  onClose,
  currentUser
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsScrollRef, setCommentsScrollRef] = React.useState<HTMLDivElement | null>(null);

  const currentItem = items[currentIndex];
  const imageUrl = currentItem?.imageUrl || initialImageUrl;
  const title = currentItem?.title || initialTitle;
  const currentImageId = currentItem?.id;

  // Fetch comments for current image
  useEffect(() => {
    if (!currentImageId) return;

    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/broadcasts/images/${currentImageId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(Array.isArray(data) ? data : []);
          console.log('[ZOOM MODAL] Loaded', data.length, 'comments for image', currentImageId);
        }
      } catch (error) {
        console.error('[ZOOM MODAL] Error loading comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
    // Reset zoom level when changing images
    setZoomLevel(1);
    setCommentText('');
  }, [currentImageId]);

  // Auto-scroll comments to bottom when new ones added
  useEffect(() => {
    if (commentsScrollRef) {
      commentsScrollRef.scrollTop = commentsScrollRef.scrollHeight;
    }
  }, [comments]);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentImageId) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/broadcasts/images/${currentImageId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_text: commentText.trim(),
          username: currentUser?.username || 'Anonymous User'
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        console.log('[ZOOM MODAL] Comment added successfully');
      } else {
        const error = await response.json();
        alert(`Failed to add comment: ${error.error}`);
      }
    } catch (error) {
      console.error('[ZOOM MODAL] Error submitting comment:', error);
      alert('Error submitting comment');
    } finally {
      setIsSubmittingComment(false);
    }
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
      <div className="relative bg-black rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto z-[9999999] !z-[9999999] flex flex-col items-center gap-4 w-[95%]">
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

        {/* Main Image with Zoom - Now Pannable */}
        <div 
          className="rounded bg-gray-900"
          style={{
            width: '100%',
            height: '50vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoomLevel > 1 ? 'grab' : 'default',
            position: 'relative'
          }}
          onWheel={(e) => {
            if (e.deltaY > 0) handleZoomOut();
            else handleZoomIn();
            e.preventDefault();
          }}
        >
          <img
            ref={(el) => {
              if (el && zoomLevel > 1) {
                el.style.cursor = 'grabbing';
              }
            }}
            src={imageUrl}
            alt={title}
            className="rounded transition-transform duration-200 select-none"
            draggable="false"
            style={{ 
              transform: `scale(${zoomLevel})`,
              width: zoomLevel === 1 ? '100%' : 'auto',
              height: zoomLevel === 1 ? '100%' : 'auto',
              objectFit: 'contain',
              transformOrigin: 'center center',
              maxWidth: 'none'
            }}
            onMouseDown={(e) => {
              if (zoomLevel <= 1) return;
              
              const img = e.currentTarget;
              const rect = img.parentElement!.getBoundingClientRect();
              const startX = e.clientX;
              const startY = e.clientY;
              const scrollLeft = img.parentElement!.scrollLeft;
              const scrollTop = img.parentElement!.scrollTop;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = startX - moveEvent.clientX;
                const deltaY = startY - moveEvent.clientY;
                img.parentElement!.scrollLeft = scrollLeft + deltaX;
                img.parentElement!.scrollTop = scrollTop + deltaY;
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Image Title & Counter */}
        <div className="text-center w-full">
          <p className="text-white text-sm font-semibold">{title}</p>
          <p className="text-gray-400 text-xs mt-1">
            Image {currentIndex + 1} of {items.length}
          </p>
        </div>

        {/* Navigation Arrows & Zoom Controls */}
        {items.length > 1 && (
          <div className="flex gap-4 justify-center w-full flex-wrap">
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

            {/* Zoom Out Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
              title="Zoom out (↓)"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-6 w-6" />
            </Button>

            {/* Zoom Level Display */}
            <div className="h-10 px-3 bg-black/50 text-white border border-gray-600 rounded flex items-center justify-center text-xs font-semibold">
              {(zoomLevel * 100).toFixed(0)}%
            </div>

            {/* Zoom In Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
              title="Zoom in (↑)"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-6 w-6" />
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
        <p className="text-gray-500 text-xs text-center">
          Use ← → to navigate • ↑ ↓ to zoom • ESC to close
        </p>

        {/* Comments Section */}
        <div className="w-full border-t border-gray-700 pt-4 flex flex-col gap-3 max-h-[25vh]">
          <h3 className="text-white text-sm font-semibold">Comments</h3>

          {/* Comments Display */}
          <div
            ref={setCommentsScrollRef}
            className="flex-1 overflow-y-auto space-y-2 border border-gray-700 rounded p-3 bg-gray-900/50"
          >
            {isLoadingComments ? (
              <p className="text-gray-400 text-xs">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-700 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-gray-300 text-xs font-semibold">{comment.username}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-200 text-xs mt-1">{comment.comment_text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs italic">No comments yet. Be the first!</p>
            )}
          </div>

          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                disabled={isSubmittingComment}
              />
              <Button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white h-10 px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <p className="text-gray-400 text-xs italic">Login to add a comment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastCarouselZoomModal;
