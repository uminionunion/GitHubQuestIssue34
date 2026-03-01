import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function TheMemeBoxImplementation001() {
    // =====================================================
    // STATE VARIABLES
    // =====================================================

    const [allPosts, setAllPosts] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [commentImageData, setCommentImageData] = useState(null);
    const [detailImageIndex, setDetailImageIndex] = useState(0);
    const [autoRotateTimer, setAutoRotateTimer] = useState(null);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isViewCommentsDialogOpen, setIsViewCommentsDialogOpen] = useState(false);
    const [isFavoritesGridOpen, setIsFavoritesGridOpen] = useState(false);
    const [isFavoriteDetailOpen, setIsFavoriteDetailOpen] = useState(false);
    const [selectedFavoritePost, setSelectedFavoritePost] = useState(null);
    const [commentTitle, setCommentTitle] = useState('');
    const [commentDescription, setCommentDescription] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [currentUsername, setCurrentUsername] = useState('DemoUser');

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const SWIPE_THRESHOLD = 50;
    const MAX_UPLOAD_IMAGES = 50;
    const AUTO_ROTATE_INTERVAL = 5000;
    const AUTO_ROTATE_DELAY = 3000;

    // =====================================================
    // SAMPLE DATA
    // =====================================================

    const samplePosts = [
        {
            id: 1,
            title: "Laughing Cat",
            description: "This cat is having the best time ever!",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ff9999' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3ECat Meme 1%3C/text%3E%3C/svg%3E"],
            upvotes: 15,
            downvotes: 2,
            userVote: null,
            timestamp: new Date(Date.now() - 86400000),
            comments: [
                {
                    id: 101,
                    title: "So funny!",
                    description: "Made me laugh out loud",
                    image: null,
                    upvotes: 5,
                    downvotes: 0,
                    userVote: null,
                    timestamp: new Date(Date.now() - 3600000),
                    hidden: false
                }
            ],
            isFavorited: false
        },
        {
            id: 2,
            title: "Dog Jump",
            description: "Pupper jumping super high!",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2399ccff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDog Meme 2%3C/text%3E%3C/svg%3E"],
            upvotes: 8,
            downvotes: 1,
            userVote: null,
            timestamp: new Date(Date.now() - 172800000),
            comments: [],
            isFavorited: false
        },
        {
            id: 3,
            title: "Bird Confused",
            description: "Why is this bird so confused?",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ffff99' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EBird Meme 3%3C/text%3E%3C/svg%3E"],
            upvotes: 12,
            downvotes: 3,
            userVote: null,
            timestamp: new Date(Date.now() - 259200000),
            comments: [
                {
                    id: 301,
                    title: "LOL",
                    description: "This is hilarious",
                    image: null,
                    upvotes: 3,
                    downvotes: 0,
                    userVote: null,
                    timestamp: new Date(Date.now() - 7200000),
                    hidden: false
                }
            ],
            isFavorited: false
        },
        {
            id: 4,
            title: "Fish Thinking",
            description: "Deep thoughts from a fish",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2399ff99' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EFish Meme 4%3C/text%3E%3C/svg%3E"],
            upvotes: 6,
            downvotes: 5,
            userVote: null,
            timestamp: new Date(Date.now() - 345600000),
            comments: [],
            isFavorited: false
        },
        {
            id: 5,
            title: "Monkey Party",
            description: "Monkeys having the time of their lives!",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ff99ff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EMonkey Meme 5%3C/text%3E%3C/svg%3E"],
            upvotes: 20,
            downvotes: 1,
            userVote: null,
            timestamp: new Date(Date.now() - 1800000),
            comments: [
                {
                    id: 501,
                    title: "Amazing!",
                    description: "Best meme ever",
                    image: null,
                    upvotes: 8,
                    downvotes: 0,
                    userVote: null,
                    timestamp: new Date(Date.now() - 600000),
                    hidden: false
                }
            ],
            isFavorited: true
        },
        {
            id: 6,
            title: "Penguin Waddle",
            description: "Adorable penguin waddle",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ccccff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EPenguin Meme 6%3C/text%3E%3C/svg%3E"],
            upvotes: 3,
            downvotes: 2,
            userVote: null,
            timestamp: new Date(Date.now() - 432000000),
            comments: [],
            isFavorited: false
        },
        {
            id: 7,
            title: "Rabbit Hop",
            description: "Fastest rabbit in the west",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ffcccc' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3ERabbit Meme 7%3C/text%3E%3C/svg%3E"],
            upvotes: 11,
            downvotes: 4,
            userVote: null,
            timestamp: new Date(Date.now() - 518400000),
            comments: [
                {
                    id: 701,
                    title: "Super fast!",
                    description: "Incredible speed",
                    image: null,
                    upvotes: 2,
                    downvotes: 0,
                    userVote: null,
                    timestamp: new Date(Date.now() - 400000),
                    hidden: false
                }
            ],
            isFavorited: false
        },
        {
            id: 8,
            title: "Owl Wisdom",
            description: "The owl knows all secrets",
            images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ffffcc' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EOwl Meme 8%3C/text%3E%3C/svg%3E"],
            upvotes: 7,
            downvotes: 6,
            userVote: null,
            timestamp: new Date(Date.now() - 604800000),
            comments: [],
            isFavorited: false
        }
    ];

    // =====================================================
    // INITIALIZATION
    // =====================================================

    useEffect(() => {
        setAllPosts(samplePosts);
    }, []);

    // =====================================================
    // AUTO-ROTATE FUNCTIONALITY
    // =====================================================

    const startAutoRotate = useCallback(() => {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
        }

        const timer = setInterval(() => {
            setCurrentImageIndex(prev => {
                const post = allPosts[currentPostIndex];
                if (post && prev < post.images.length - 1) {
                    return prev + 1;
                } else {
                    showNextPost();
                    return 0;
                }
            });
        }, AUTO_ROTATE_INTERVAL);

        setAutoRotateTimer(timer);
    }, [allPosts, currentPostIndex]);

    const restartAutoRotate = useCallback(() => {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
        }

        const timer = setTimeout(() => {
            startAutoRotate();
        }, AUTO_ROTATE_DELAY);

        setAutoRotateTimer(timer);
    }, [autoRotateTimer, startAutoRotate]);

    // =====================================================
    // POST NAVIGATION
    // =====================================================

    const showNextPost = useCallback(() => {
        setCurrentPostIndex(prev => {
            const nextIndex = (prev + 1) % allPosts.length;
            setCurrentImageIndex(0);
            return nextIndex;
        });
        restartAutoRotate();
    }, [allPosts.length, restartAutoRotate]);

    const showPreviousPost = useCallback(() => {
        setCurrentPostIndex(prev => {
            const nextIndex = prev === 0 ? allPosts.length - 1 : prev - 1;
            setCurrentImageIndex(0);
            return nextIndex;
        });
        restartAutoRotate();
    }, [allPosts.length, restartAutoRotate]);

    const showNextImage = useCallback(() => {
        const post = allPosts[currentPostIndex];
        if (post && currentImageIndex < post.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        } else {
            showNextPost();
        }
        restartAutoRotate();
    }, [allPosts, currentPostIndex, currentImageIndex, showNextPost, restartAutoRotate]);

    const showPreviousImage = useCallback(() => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        } else {
            showPreviousPost();
        }
        restartAutoRotate();
    }, [currentImageIndex, showPreviousPost, restartAutoRotate]);

    // =====================================================
    // VOTING FUNCTIONS
    // =====================================================

    const handleUpvote = useCallback(() => {
        const updatedPosts = [...allPosts];
        const post = updatedPosts[currentPostIndex];

        if (post.userVote === 1) {
            post.upvotes--;
            post.userVote = null;
        } else if (post.userVote === -1) {
            post.downvotes--;
            post.upvotes++;
            post.userVote = 1;
        } else {
            post.upvotes++;
            post.userVote = 1;
        }

        setAllPosts(updatedPosts);
        logAction('upvote', post.id);
    }, [allPosts, currentPostIndex]);

    const handleDownvote = useCallback(() => {
        const updatedPosts = [...allPosts];
        const post = updatedPosts[currentPostIndex];

        if (post.userVote === -1) {
            post.downvotes--;
            post.userVote = null;
        } else if (post.userVote === 1) {
            post.upvotes--;
            post.downvotes++;
            post.userVote = -1;
        } else {
            post.downvotes++;
            post.userVote = -1;
        }

        if (post.downvotes >= 10) {
            const newPosts = updatedPosts.filter(p => p.id !== post.id);
            setAllPosts(newPosts);
            if (currentPostIndex >= newPosts.length) {
                setCurrentPostIndex(Math.max(0, newPosts.length - 1));
            }
        } else {
            setAllPosts(updatedPosts);
        }

        logAction('downvote', post.id);
    }, [allPosts, currentPostIndex]);

    const handleCommentVote = useCallback((commentId, isUpvote) => {
        const updatedPosts = [...allPosts];
        const post = updatedPosts[currentPostIndex];

        if (post && post.comments) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                if (isUpvote) {
                    if (comment.userVote === 1) {
                        comment.upvotes--;
                        comment.userVote = null;                     } else if (comment.userVote === -1) {
                        comment.downvotes--;
                        comment.upvotes++;
                        comment.userVote = 1;
                    } else {
                        comment.upvotes++;
                        comment.userVote = 1;
                    }
                } else {
                    if (comment.userVote === -1) {
                        comment.downvotes--;
                        comment.userVote = null;
                    } else if (comment.userVote === 1) {
                        comment.upvotes--;
                        comment.downvotes++;
                        comment.userVote = -1;
                    } else {
                        comment.downvotes++;
                        comment.userVote = -1;
                    }
                }
            }
        }

        setAllPosts(updatedPosts);
    }, [allPosts, currentPostIndex]);

    // =====================================================
    // FAVORITE FUNCTIONS
    // =====================================================

    const handleFavorite = useCallback(() => {
        const updatedPosts = [...allPosts];
        updatedPosts[currentPostIndex].isFavorited = !updatedPosts[currentPostIndex].isFavorited;
        setAllPosts(updatedPosts);
        logAction('favorite', updatedPosts[currentPostIndex].id);
    }, [allPosts, currentPostIndex]);

    const removeFromFavorites = useCallback((postId) => {
        const updatedPosts = allPosts.map(post => 
            post.id === postId ? { ...post, isFavorited: false } : post
        );
        setAllPosts(updatedPosts);
        closeFavoriteDetail();
    }, [allPosts]);

    // =====================================================
    // DIALOG FUNCTIONS
    // =====================================================

    const openUploadDialog = () => setIsUploadDialogOpen(true);
    const closeUploadDialog = () => {
        setIsUploadDialogOpen(false);
        setUploadTitle('');
        setUploadDescription('');
        setUploadedImages([]);
    };

    const openCommentDialog = () => setIsCommentDialogOpen(true);
    const closeCommentDialog = () => {
        setIsCommentDialogOpen(false);
        setCommentTitle('');
        setCommentDescription('');
        setCommentImageData(null);
    };

    const openViewCommentsDialog = () => setIsViewCommentsDialogOpen(true);
    const closeViewCommentsDialog = () => setIsViewCommentsDialogOpen(false);

    const showFavoritesGrid = () => setIsFavoritesGridOpen(true);
    const closeFavoritesGrid = () => setIsFavoritesGridOpen(false);

    const openFavoriteDetail = (post) => {
        setSelectedFavoritePost(post);
        setDetailImageIndex(0);
        setIsFavoriteDetailOpen(true);
    };

    const closeFavoriteDetail = () => {
        setIsFavoriteDetailOpen(false);
        setSelectedFavoritePost(null);
        setDetailImageIndex(0);
    };

    const showDetailNextImage = () => {
        if (selectedFavoritePost && detailImageIndex < selectedFavoritePost.images.length - 1) {
            setDetailImageIndex(prev => prev + 1);
        }
    };

    const showDetailPreviousImage = () => {
        if (detailImageIndex > 0) {
            setDetailImageIndex(prev => prev - 1);
        }
    };

    // =====================================================
    // FILE UPLOAD FUNCTIONS
    // =====================================================

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        files.slice(0, MAX_UPLOAD_IMAGES - uploadedImages.length).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImages(prev => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCommentImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCommentImageData(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeUploadedImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    const submitUpload = () => {
        if (!uploadTitle.trim() || uploadedImages.length === 0) {
            alert('Please enter a title and select at least one image');
            return;
        }

        const newPost = {
            id: Math.max(...allPosts.map(p => p.id), 0) + 1,
            title: uploadTitle,
            description: uploadDescription,
            images: uploadedImages,
            upvotes: 0,
            downvotes: 0,
            userVote: null,
            timestamp: new Date(),
            comments: [],
            isFavorited: false
        };

        setAllPosts(prev => [newPost, ...prev]);
        closeUploadDialog();
        logAction('upload', newPost.id);
    };

    const submitComment = () => {
        if (!commentTitle.trim() || !commentDescription.trim()) {
            alert('Please enter a comment title and description');
            return;
        }

        const updatedPosts = [...allPosts];
        const post = updatedPosts[currentPostIndex];

        const newComment = {
            id: Math.max(...post.comments.map(c => c.id), 0) + 1,
            title: commentTitle,
            description: commentDescription,
            image: commentImageData,
            upvotes: 0,
            downvotes: 0,
            userVote: null,
            timestamp: new Date(),
            hidden: false
        };

        post.comments.push(newComment);
        setAllPosts(updatedPosts);
        closeCommentDialog();
        logAction('comment', post.id);
    };

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    const getTimeElapsed = (timestamp) => {
        const now = new Date();
        const seconds = Math.floor((now - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `\${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `\${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `\${Math.floor(seconds / 86400)}d ago`;
        return `\${Math.floor(seconds / 604800)}w ago`;
    };

    const getPageTitle = () => {
        if (currentPage === 1) return 'User Posts';
        if (currentPage === 2) return 'All Posts';
        if (currentPage === 3) return 'Favorites';
        return 'Posts';
    };

    const logAction = (action, postId) => {
        console.log(`Action: \${action}, Post ID: \${postId}, Timestamp: \${new Date().toISOString()}`);
    };

    const canSeePost = (post) => post.downvotes < 5;

    const handlePageNavigation = () => {
        setCurrentPage(prev => (prev === 3 ? 1 : prev + 1));
        setCurrentPostIndex(0);
        setCurrentImageIndex(0);
    };

    // =====================================================
    // TOUCH & KEYBOARD HANDLING
    // =====================================================

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX.current - touchEndX;
        const diffY = touchStartY.current - touchEndY;

        if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffY) < SWIPE_THRESHOLD / 2) {
            if (diffX > 0) {
                showNextImage();
            } else {
                showPreviousImage();
            }
        }
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowDown') showNextPost();
            if (e.key === 'ArrowUp') showPreviousPost();
            if (e.key === 'u' || e.key === 'U') handleUpvote();
            if (e.key === 'd' || e.key === 'D') handleDownvote();
            if (e.key === 'f' || e.key === 'F') handleFavorite();
            if (e.key === 'c' || e.key === 'C') openCommentDialog();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleUpvote, handleDownvote, handleFavorite]);

    // =====================================================
    // FILTERED POSTS
    // =====================================================

    const getFilteredPosts = useCallback(() => {
        if (currentPage === 1) {
            return allPosts;
        } else if (currentPage === 2) {
            return allPosts.filter(p => canSeePost(p));
        } else if (currentPage === 3) {
            return allPosts.filter(p => p.isFavorited);
        }
        return allPosts;
    }, [allPosts, currentPage]);

    const filteredPosts = getFilteredPosts();
    const displayPost = filteredPosts[currentPostIndex];
    const displayImage = displayPost?.images[currentImageIndex];
    const favoritesPosts = allPosts.filter(p => p.isFavorited);

    // =====================================================
    // STYLES
    // =====================================================

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontFamily: 'inherit',
            overflow: 'hidden'
        },
        navbar: {
            backgroundColor: '#222222',
            borderBottom: '2px solid #444444',
            padding: '16px 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        },
        navbarContent: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        navbarTitle: {
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            color: '#00ff00'
        },
        navbarButtons: {
            display: 'flex',
            gap: '12px'
        },
        navButton: {
            backgroundColor: '#0066ff',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        },
        postViewerContainer: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            padding: '20px'
        },
        imageCarousel: {
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto 20px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)'
        },
        postImage: {
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '12px'
        },
        imageCounter: {
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
        },
        postInfo: {
            textAlign: 'center',
            marginBottom: '20px'
        },
        postTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#00ff00'
        },
        postDescription: {
            fontSize: '14px',
            color: '#cccccc',
            margin: '0 0 8px 0'
        },
        postTime: {
            fontSize: '12px',
            color: '#999999',
            margin: 0
        },
        voteSection: {
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#222222',
            borderRadius: '8px'
        },
        voteCount: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        voteNumber: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#00ff00'
        },
        voteLabel: {
            fontSize: '12px',
            color: '#999999',
            marginTop: '4px'
        },
        actionButtonsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
            justifyContent: 'center'
        },
        actionButton: {
            backgroundColor: '#333333',
            color: '#ffffff',
            border: '2px solid #666666',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            minWidth: '100px'
        },
        actionButtonActive: {
            backgroundColor: '#00ff00',
            color: '#000000',
            borderColor: '#00ff00'
        },
        navigationButtons: {
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            justifyContent: 'center'
        },
        navArrowButton: {
            backgroundColor: '#0066ff',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '120px'
        },
        imageNavigation: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
        },
        imageNavButton: {
            backgroundColor: '#663300',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        dialog: {
            backgroundColor: '#222222',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
        },
        favoritesDialog: {
            backgroundColor: '#222222',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
        },
        dialogHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #444444'
        },
        dialogContent: {
            flex: 1,
            overflow: 'auto',
            padding: '20px'
        },
        dialogFooter: {
            display: 'flex',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #444444',
            justifyContent: 'flex-end'
        },
        closeButton: {
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '32px',
            height: '32px'
        },
        formGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ffffff'
        },
        input: {
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#333333',
            color: '#ffffff',
            border: '1px solid #444444',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
        },
        textarea: {
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#333333',
            color: '#ffffff',
            border: '1px solid #444444',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            minHeight: '100px',
            resize: 'vertical'
        },
        characterCount: {
            display: 'block',
            fontSize: '12px',
            color: '#999999',
            marginTop: '4px'
        },
        fileInput: {
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#333333',
            color: '#ffffff',
            border: '1px solid #444444',
            borderRadius: '6px',
            cursor: 'pointer',
            boxSizing: 'border-box'
        },
        helpText: {
            fontSize: '12px',
            color: '#999999',
            marginTop: '6px'
        },
        imagePreviewContainer: {
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#333333',
            borderRadius: '8px'
        },
        imagePreviewGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px',
            marginTop: '8px'
        },
        imagePreviewItem: {
            position: 'relative',
            borderRadius: '6px',
            overflow: 'hidden'
        },
        imagePreview: {
            width: '100%',
            height: '80px',
            objectFit: 'cover',
            borderRadius: '6px'
        },
        commentImagePreview: {
            width: '100%',
            maxHeight: '200px',
            objectFit: 'contain',
            borderRadius: '6px',
            marginTop: '8px'
        },
        removeImageButton: {
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: '#ffffff',
            border: 'none',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
        },
        cancelButton: {
            backgroundColor: '#666666',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        },
        submitButton: {
            backgroundColor: '#00ff00',
            color: '#000000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
        },
        commentsListContainer: {
            flex: 1,
            overflow: 'auto',
            marginBottom: '16px',
            maxHeight: '400px'
        },
        commentItem: {
            backgroundColor: '#333333',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            borderLeft: '4px solid #0066ff'
        },
        commentHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px'
        },
        commentTitle: {
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#00ff00',
            flex: 1
        },
        commentTime: {
            fontSize: '12px',
            color: '#999999',
            marginLeft: '8px'
        },
        commentText: {
            margin: '0 0 8px 0',
            fontSize: '13px',
            color: '#cccccc',
            lineHeight: '1.4'
        },
        commentImage: {
            width: '100%',
            maxHeight: '150px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginBottom: '8px'
        },
        commentVotes: {
            display: 'flex',
            gap: '8px'
        },
        commentVoteButton: {
            backgroundColor: '#444444',
            color: '#ffffff',
            border: '1px solid #666666',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.3s ease'
        },
        commentVoteButtonActive: {
            backgroundColor: '#00ff00',
            color: '#000000',
            borderColor: '#00ff00'
        },
        emptyCommentsText: {
            textAlign: 'center',
            color: '#999999',
            padding: '20px'
        },
        favoritesGridContainer: {
            flex: 1,
            overflow: 'auto'
        },
        favoritesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
            padding: '16px'
        },
        favoriteCard: {
            backgroundColor: '#333333',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid transparent'
        },
        favoriteCardImage: {
            width: '100%',
            height: '150px',
            objectFit: 'cover'
        },
        favoriteCardInfo: {
            padding: '12px'
        },
        favoriteCardTitle: {
            margin: '0 0 6px 0',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#00ff00',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        favoriteCardMeta: {
            margin: 0,
            fontSize: '12px',
            color: '#999999'
        },
        emptyFavoritesText: {
            textAlign: 'center',
            color: '#999999',
            padding: '40px 20px',
            fontSize: '14px'
        },
        detailImageContainer: {
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px'
        },
        detailImage: {
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '8px'
        },
        detailDescription: {
            fontSize: '14px',
            color: '#cccccc',
            lineHeight: '1.6',
            marginBottom: '16px'
        },
        detailStats: {
            display: 'flex',
            justifyContent: 'space-around',
            backgroundColor: '#333333',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
        },
        statItem: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        statLabel: {
            fontSize: '12px',
            color: '#999999'
        },
        statValue: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ff00',
            marginTop: '4px'
        },
        detailImageNavigation: {
            display: 'flex',
            gap: '8px'
        },
        detailNavButton: {
            flex: 1,
            backgroundColor: '#0066ff',
            color: '#ffffff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
        },
        emptyState: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#999999'
        },
        footer: {
            backgroundColor: '#222222',
            borderTop: '2px solid #444444',
            padding: '12px 20px',
            textAlign: 'center',
            fontSize: '12px'
        },
        footerText: {
            margin: '0 0 4px 0',
            color: '#cccccc'
        },
        footerHint: {
            margin: 0,
            color: '#999999',
            fontSize: '11px'
        }
    };

    // =====================================================
    // RENDER FUNCTIONS
    // =====================================================

    const renderNavbar = () => (
        <div style={styles.navbar}>
            <div style={styles.navbarContent}>
                <h1 style={styles.navbarTitle}>🎬 TheMemeBox</h1>
                <div style={styles.navbarButtons}>
                    <button style={styles.navButton} onClick={openUploadDialog}>
                        📤 Upload
                    </button>
                    <button style={styles.navButton} onClick={handlePageNavigation}>
                        📄 {getPageTitle()}
                    </button>
                    <button style={styles.navButton} onClick={showFavoritesGrid}>
                        ⭐ Favorites ({favoritesPosts.length})
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPostViewer = () => {
        if (!displayPost) {
            return (
                <div style={styles.postViewerContainer}>
                    <div style={styles.emptyState}>
                        No posts available
                    </div>
                </div>
            );
        }

        return (
            <div style={styles.postViewerContainer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div style={styles.imageCarousel}>
                    {displayImage && (
                        <img
                            src={displayImage}
                            alt="post"
                            style={styles.postImage}
                        />
                    )}
                    <div style={styles.imageCounter}>
                        {currentImageIndex + 1} / {displayPost.images.length}
                    </div>
                </div>

                <div style={styles.postInfo}>
                    <h2 style={styles.postTitle}>{displayPost.title}</h2>
                    <p style={styles.postDescription}>{displayPost.description}</p>
                    <p style={styles.postTime}>{getTimeElapsed(displayPost.timestamp)}</p>
                </div>

                <div style={styles.voteSection}>
                    <div style={styles.voteCount}>
                        <div style={styles.voteNumber}>👍 {displayPost.upvotes}</div>
                        <div style={styles.voteLabel}>Upvotes</div>
                    </div>
                    <div style={styles.voteCount}>
                        <div style={styles.voteNumber}>👎 {displayPost.downvotes}</div>
                        <div style={styles.voteLabel}>Downvotes</div>
                    </div>
                    <div style={styles.voteCount}>
                        <div style={styles.voteNumber}>💬 {displayPost.comments.length}</div>
                        <div style={styles.voteLabel}>Comments</div>
                    </div>
                </div>

                <div style={styles.actionButtonsContainer}>
                    <button
                        style={{
                            ...styles.actionButton,
                            ...(displayPost.userVote === 1 ? styles.actionButtonActive : {})
                        }}
                        onClick={handleUpvote}
                    >
                        👍 Upvote
                    </button>
                    <button
                        style={{
                            ...styles.actionButton,
                            ...(displayPost.userVote === -1 ? styles.actionButtonActive : {})
                        }}
                        onClick={handleDownvote}
                    >
                        👎 Downvote
                    </button>
                    <button
                        style={{
                            ...styles.actionButton,
                            ...(displayPost.isFavorited ? styles.actionButtonActive : {})
                        }}
                        onClick={handleFavorite}
                    >
                        ⭐ Favorite
                    </button>
                    <button style={styles.actionButton} onClick={openCommentDialog}>
                        💬 Comment
                    </button>
                    <button style={styles.actionButton} onClick={openViewCommentsDialog}>
                        👁 View Comments
                    </button>
                </div>

                {displayPost.images.length > 1 && (
                    <div style={styles.imageNavigation}>
                        <button style={styles.imageNavButton} onClick={showPreviousImage} disabled={currentImageIndex === 0}>
                            ← Previous Image
                        </button>
                        <button style={styles.imageNavButton} onClick={showNextImage} disabled={currentImageIndex === displayPost.images.length - 1}>
                            Next Image →
                        </button>
                    </div>
                )}

                <div style={styles.navigationButtons}>
                    <button style={styles.navArrowButton} onClick={showPreviousPost}>
                        ⬆ Previous Post
                    </button>
                    <button style={styles.navArrowButton} onClick={showNextPost}>
                        ⬇ Next Post
                    </button>
                </div>
            </div>
        );
    };

    const renderUploadDialog = () => {
        if (!isUploadDialogOpen) return null;

        return (
            <div style={styles.overlay} onClick={closeUploadDialog}>
                <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.dialogHeader}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>📤 Upload New Meme</h2>
                        <button style={styles.closeButton} onClick={closeUploadDialog}>✕</button>
                    </div>

                    <div style={styles.dialogContent}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Meme Title *</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                placeholder="Enter a catchy title..."
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                style={styles.textarea}
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Tell us about your meme..."
                            />
                            <span style={styles.characterCount}>
                                {uploadDescription.length} characters
                            </span>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Upload Images *</label>
                            <input
                                style={styles.fileInput}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <span style={styles.helpText}>
                                {uploadedImages.length} / {MAX_UPLOAD_IMAGES} images selected
                            </span>
                        </div>

                        {uploadedImages.length > 0 && (
                            <div style={styles.imagePreviewContainer}>
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>Preview:</span>
                                <div style={styles.imagePreviewGrid}>
                                    {uploadedImages.map((img, idx) => (
                                        <div key={idx} style={styles.imagePreviewItem}>
                                            <img src={img} alt={`preview-${idx}`} style={styles.imagePreview} />
                                            <button
                                                style={styles.removeImageButton}
                                                onClick={() => removeUploadedImage(idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.dialogFooter}>
                        <button style={styles.cancelButton} onClick={closeUploadDialog}>
                            Cancel
                        </button>
                        <button style={styles.submitButton} onClick={submitUpload}>
                            Upload Meme
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCommentDialog = () => {
        if (!isCommentDialogOpen) return null;

        return (
            <div style={styles.overlay} onClick={closeCommentDialog}>
                <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.dialogHeader}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>💬 Add Comment</h2>
                        <button style={styles.closeButton} onClick={closeCommentDialog}>✕</button>
                    </div>

                    <div style={styles.dialogContent}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Comment Title *</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={commentTitle}
                                onChange={(e) => setCommentTitle(e.target.value)}
                                placeholder="Brief comment title..."
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Comment *</label>
                            <textarea
                                style={styles.textarea}
                                value={commentDescription}
                                onChange={(e) => setCommentDescription(e.target.value)}
                                placeholder="Share your thoughts..."
                            />
                            <span style={styles.characterCount}>
                                {commentDescription.length} characters
                            </span>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Attach Image (Optional)</label>
                            <input
                                style={styles.fileInput}
                                type="file"
                                accept="image/*"
                                onChange={handleCommentImageSelect}
                            />
                        </div>

                        {commentImageData && (
                            <img
                                src={commentImageData}
                                alt="comment-preview"
                                style={styles.commentImagePreview}
                            />
                        )}
                    </div>

                    <div style={styles.dialogFooter}>
                        <button style={styles.cancelButton} onClick={closeCommentDialog}>
                            Cancel
                        </button>
                        <button style={styles.submitButton} onClick={submitComment}>
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderViewCommentsDialog = () => {
        if (!isViewCommentsDialogOpen) return null;

        const post = displayPost;

        return (
            <div style={styles.overlay} onClick={closeViewCommentsDialog}>
                <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.dialogHeader}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>
                            💬 Comments ({post?.comments.length || 0})
                        </h2>
                        <button style={styles.closeButton} onClick={closeViewCommentsDialog}>✕</button>
                    </div>

                    <div style={styles.dialogContent}>
                        <div style={styles.commentsListContainer}>
                            {post && post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.id} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <h3 style={styles.commentTitle}>{comment.title}</h3>
                                            <span style={styles.commentTime}>
                                                {getTimeElapsed(comment.timestamp)}
                                            </span>
                                        </div>
                                        <p style={styles.commentText}>{comment.description}</p>
                                        {comment.image && (
                                            <img
                                                src={comment.image}
                                                alt="comment"
                                                style={styles.commentImage}
                                            />
                                        )}
                                        <div style={styles.commentVotes}>
                                            <button
                                                style={{
                                                    ...styles.commentVoteButton,
                                                    ...(comment.userVote === 1 ? styles.commentVoteButtonActive : {})
                                                }}
                                                onClick={() => handleCommentVote(comment.id, true)}
                                            >
                                                👍 {comment.upvotes}
                                            </button>
                                            <button
                                                style={{
                                                    ...styles.commentVoteButton,
                                                    ...(comment.userVote === -1 ? styles.commentVoteButtonActive : {})
                                                }}
                                                onClick={() => handleCommentVote(comment.id, false)}
                                            >
                                                👎 {comment.downvotes}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyCommentsText}>
                                    No comments yet. Be the first to comment!
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.dialogFooter}>
                        <button style={styles.submitButton} onClick={() => {
                            closeViewCommentsDialog();
                            openCommentDialog();
                        }}>
                            Add Comment
                        </button>
                        <button style={styles.cancelButton} onClick={closeViewCommentsDialog}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFavoritesDialog = () => {
        if (!isFavoritesGridOpen) return null;

        return (
            <div style={styles.overlay} onClick={closeFavoritesGrid}>
                <div style={styles.favoritesDialog} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.dialogHeader}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>⭐ Your Favorites</h2>
                        <button style={styles.closeButton} onClick={closeFavoritesGrid}>✕</button>
                    </div>

                    <div style={styles.favoritesGridContainer}>
                        {favoritesPosts.length > 0 ? (
                            <div style={styles.favoritesGrid}>
                                {favoritesPosts.map(post => (
                                    <div
                                        key={post.id}
                                        style={styles.favoriteCard}
                                        onClick={() => openFavoriteDetail(post)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.borderColor = '#00ff00';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                    >
                                        <img
                                            src={post.images[0]}
                                            alt={post.title}
                                            style={styles.favoriteCardImage}
                                        />
                                        <div style={styles.favoriteCardInfo}>
                                            <h3 style={styles.favoriteCardTitle}>{post.title}</h3>
                                            <p style={styles.favoriteCardMeta}>
                                                👍 {post.upvotes} | 💬 {post.comments.length}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyFavoritesText}>
                                No favorites yet. Start favoriting memes! ⭐
                            </div>
                        )}
                    </div>

                    <div style={styles.dialogFooter}>
                        <button style={styles.cancelButton} onClick={closeFavoritesGrid}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFavoriteDetailDialog = () => {
        if (!isFavoriteDetailOpen || !selectedFavoritePost) return null;

        const post = selectedFavoritePost;

        return (
            <div style={styles.overlay} onClick={closeFavoriteDetail}>
                <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.dialogHeader}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>{post.title}</h2>
                        <button style={styles.closeButton} onClick={closeFavoriteDetail}>✕</button>
                    </div>

                    <div style={styles.dialogContent}>
                        <div style={styles.detailImageContainer}>
                            <img
                                src={post.images[detailImageIndex]}
                                alt={post.title}
                                style={styles.detailImage}
                            />
                            {post.images.length > 1 && (
    <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    }}>
        {detailImageIndex + 1} / {post.images.length}
    </div>
)}

                        </div>

                        <p style={styles.detailDescription}>{post.description}</p>

                        <div style={styles.detailStats}>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Upvotes</div>
                                <div style={styles.statValue}>{post.upvotes}</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Downvotes</div>
                                <div style={styles.statValue}>{post.downvotes}</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Comments</div>
                                <div style={styles.statValue}>{post.comments.length}</div>
                            </div>
                        </div>

                        {post.images.length > 1 && (
                            <div style={styles.detailImageNavigation}>
                                <button
                                    style={styles.detailNavButton}
                                    onClick={showDetailPreviousImage}
                                    disabled={detailImageIndex === 0}
                                >
                                    ← Previous
                                </button>
                                <button
                                    style={styles.detailNavButton}
                                    onClick={showDetailNextImage}
                                    disabled={detailImageIndex === post.images.length - 1}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.dialogFooter}>
                        <button
                            style={styles.actionButton}
                            onClick={() => {
                                removeFromFavorites(post.id);
                                closeFavoriteDetail();
                            }}
                        >
                            Remove from Favorites
                        </button>
                        <button style={styles.cancelButton} onClick={closeFavoriteDetail}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFooter = () => (
        <div style={styles.footer}>
            <p style={styles.footerText}>
                TheMemeBox v1.0 • {allPosts.length} posts • {favoritesPosts.length} favorites
            </p>
            <p style={styles.footerHint}>
                Keyboard: Arrow Keys to navigate • U/D for votes • F for favorite • C to comment
            </p>
        </div>
    );

    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <div style={styles.container}>
            {renderNavbar()}
            {renderPostViewer()}
            {renderFooter()}
            {renderUploadDialog()}
            {renderCommentDialog()}
            {renderViewCommentsDialog()}
            {renderFavoritesDialog()}
            {renderFavoriteDetailDialog()}
        </div>
    );
}
