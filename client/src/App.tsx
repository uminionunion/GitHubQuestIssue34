import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainUhubFeatureV001ForSisterUnionRoutes from '@/features/uminion/MainUhubFeatureV001ForSisterUnionRoutes';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import AuthModal from './features/auth/AuthModal';
import MainUhubFeatureV001ForMyProfileModal from '@/features/profile/MainUhubFeatureV001ForMyProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainUhubFeatureV001ForUserProfileModal from './features/profile/MainUhubFeatureV001ForUserProfileModal';
import BadgeZoomToast from './features/profile/BadgeZoomToast';

const MainUhubFeatureV001Layout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [sharedProfileUser, setSharedProfileUser] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [zoomedBadge, setZoomedBadge] = useState<{ url: string; name: string } | null>(null);

// Check for shared profile link in URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const openProfileUsername = params.get('openProfile');
  
  if (openProfileUsername) {
    console.log(`[SHARED PROFILE] Opening profile for user ${openProfileUsername}`);
    
    // Fetch the user data by username
    fetch(`/api/auth/user/${encodeURIComponent(openProfileUsername)}`)
      .then(res => res.json())
      .then(userData => {
        setSharedProfileUser(userData);
        setProfileModalOpen(true);
        // Remove the query param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch(err => {
        console.error('[SHARED PROFILE] Error fetching user:', err);
      });
  }
}, []);
  
  useEffect(() => {
    if (autoLaunch) {
      handleAutoLaunch();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoLaunch]);

  const handleAutoLaunch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
          setProfileModalOpen(true);
          setCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOpenModalManually = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setCountdown(null);
    }
    setProfileModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleProfileImageClick = () => {
    if (!user) {
      handleOpenAuthModal('login');
    } else {
      // Show own user profile (not my profile modal)
      setSharedProfileUser(user);
      setProfileModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      <header className="p-4 border-b border-border/50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <span id="loading-text">loading...</span>
            ) : (
              <>
                {!user ? (
                  <>
                    <Button onClick={() => handleOpenAuthModal('signup')} className="bg-orange-400 hover:bg-orange-500 text-black">Sign Up?</Button>
                    <Button onClick={() => handleOpenAuthModal('login')}>Log In?</Button>
                  </>
                ) : (
                  <Button onClick={handleLogout} variant="destructive">Log Out</Button>
                )}
              </>
            )}
          </div>
          <div onClick={handleProfileImageClick} className="cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile_image_url || "https://uminion.com/wp-content/uploads/2025/02/iArt06532.png"} alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-grow relative container mx-auto px-4 py-8 flex justify-center items-start">
        <Routes>
          <Route path="/" element={
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">welcome to uminion</h1>
              <p className="text-lg text-muted-foreground">Click the uHub button below to get started.</p>
              <Link to="/SisterUnion001NewEngland">
                <Button className="mt-4">Go to a Sister Union Page</Button>
              </Link>
            </div>
          } />
          <Route path="/*" element={<MainUhubFeatureV001ForSisterUnionRoutes />} />
        </Routes>

        

{isProfileModalOpen && (
  <div className="absolute inset-0 z-40 bg-black/50">
    {sharedProfileUser ? (
      <MainUhubFeatureV001ForUserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSharedProfileUser(null);
        }}
        user={sharedProfileUser}
        currentUser={user}
        onBadgeZoomOpen={(badge) => setZoomedBadge(badge)}
      />
    ) : (
      <MainUhubFeatureV001ForMyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenAuthModal={handleOpenAuthModal}
      />
    )}
  </div>
)}

{/* Badge zoom toast - rendered at app level, OUTSIDE modal z-index context */}
{zoomedBadge && (
  <BadgeZoomToast
    imageUrl={zoomedBadge.url}
    altText={`${zoomedBadge.name} badge`}
    onClose={() => setZoomedBadge(null)}
  />
)}
      </main>

      <footer className="p-4 border-t border-border/50 shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <Button onClick={handleOpenModalManually} className="relative">
            uHub
            {countdown !== null && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {countdown}
              </div>
            )}
          </Button>
        </div>
      </footer>

      {authModal.isOpen && (
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          onSwitchMode={(newMode) => setAuthModal({ isOpen: true, mode: newMode })}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainUhubFeatureV001Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
