import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Send, ArrowUp, ArrowDown } from 'lucide-react';
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
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  // ✅ NEW: Pan controls
  const handlePanLeft = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollLeft -= 50;
    }
  };

  const handlePanRight = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollLeft += 50;
    }
  };

  const handlePanUp = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTop -= 50;
    }
  };

  const handlePanDown = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTop += 50;
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentImageId) return;

    setIsSubmittingComment(true);
    try {
      console.log('[ZOOM MODAL] Submitting comment:', {
        imageId: currentImageId,
        comment_text: commentText.trim(),
        username: currentUser?.username || 'Anonymous User'
      });

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
        console.log('[ZOOM MODAL] ✅ Comment added successfully:', newComment);
        setComments(prev => [...prev, newComment]);
        setCommentText('');
      } else {
        const error = await response.json();
        console.error('[ZOOM MODAL] Server error response:', error);
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

        {/* Main Image Container - ✅ FIXED: overflow-auto for panning */}
        <div 
  ref={imageContainerRef}
  className="rounded bg-gray-900 overflow-auto"
  style={{
    width: '100%', // i like it at a 100%, because when the broadcast carousel image launches? it takes up the whole space properly. -3:06pm on 2/28/26
    height: '50vh',
    cursor: zoomLevel > 1 ? 'grab' : 'default',
    position: 'relative',
    scrollBehavior: 'smooth'
  }}
>
  <img
    src={imageUrl}
    alt={title}
    className="rounded transition-transform duration-200 select-none"
    draggable="false"
    style={{ 
      transform: `scale(${zoomLevel})`,
      width: 'auto',  
      height: 'auto',  
      objectFit: 'unset',
      transformOrigin: 'center center',
      display: 'block'
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

        {/* Control Sections */}
        <div className="flex gap-6 justify-center w-full flex-wrap">
          {/* PAGE SECTION - Image navigation and zoom */}
          <div className="flex flex-col gap-2 items-center">
            <p className="text-gray-400 text-xs font-semibold mb-1">Page</p>
            <div className="flex gap-2">
              {items.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
                  title="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
                title="Zoom out"
              >
                <ZoomOut className="h-6 w-6" />
              </Button>

              <div className="h-10 px-3 bg-black/50 text-white border border-gray-600 rounded flex items-center justify-center text-xs font-semibold">
                {(zoomLevel * 100).toFixed(0)}%
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
                title="Zoom in"
              >
                <ZoomIn className="h-6 w-6" />
              </Button>

              {items.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
                  title="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>

          {/* PAN SECTION - Explicit pan controls when zoomed */}
          {zoomLevel > 1 && (
            <div className="flex flex-col gap-2 items-center">
              <p className="text-gray-400 text-xs font-semibold mb-1">Pan</p>
              <div className="flex flex-col gap-1 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePanUp}
                  className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  title="Pan up"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanLeft}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan left"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanDown}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan down"
                  >
                    <ArrowDown className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanRight}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan right"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Hints */}
        <p className="text-gray-500 text-xs text-center">
          Use ← → to navigate • ↑ ↓ to zoom • ESC to close {zoomLevel > 1 && '• Click pan buttons to move around zoomed image'}
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
