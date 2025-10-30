
// Import React and hooks like useState and useEffect.
import React, { useState, useEffect, useRef } from 'react';
// Import routing components from react-router-dom.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';
// Import the Uminion Main Hub component.
import MainHubUpgradeV001ForUminionMainHub from '@/features/uminion/MainHubUpgradeV001ForUminionMainHub';
// Import the Calendar View component.
import MainHubUpgradeV001ForCalendarView from '@/features/calendar/MainHubUpgradeV001ForCalendarView';
// Import the Sister Union routes.
import MainHubUpgradeV001ForSisterUnionRoutes from '@/features/uminion/MainHubUpgradeV001ForSisterUnionRoutes';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import AuthModal from './features/auth/AuthModal';
import MainHubUpgradeV001ForMyProfileModal from './features/profile/MainHubUpgradeV001ForMyProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// A component for the main application layout.
const MainLayout = () => {
  // State to manage the loading status. Initially true.
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(true);

  // Effect to read the auto-launch setting from localStorage on component mount.
  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('uHubAutoLaunch');
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
  }, []);

  // Effect to handle the auto-launch sequence.
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

  // Function to start the auto-launch countdown.
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

  // Function to manually open the modal.
  const handleOpenModalManually = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setCountdown(null);
    }
    setProfileModalOpen(true);
  };

  // useEffect hook to simulate a loading period.
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      {/* 
        PHP Conversion Instructions:
        This header can be converted into a `header.php` file.
        The user authentication status (`user` object) would be determined by checking a `$_SESSION['user_id']` variable.
        Conditional rendering (e.g., showing "Log In" vs "Log Out") would be done with PHP `if/else` blocks.
        The avatar click would be a simple `<a>` tag or a `<div>` with an `onclick` event listener in `main.js`.
      */}
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

      {/* 
        PHP Conversion Instructions:
        This is the main content area. In a PHP app, this would be where `index.php` includes different page templates
        (e.g., `calendar.php`, `sister_union_page.php`) based on a URL parameter like `?page=...`.
        The uHub modal would be an absolutely positioned `<div>` inside this container, with its visibility toggled by JavaScript.
      */}
      <main className="flex-grow relative container mx-auto px-4 py-8 flex justify-center items-start">
        <Routes>
          <Route path="/" element={<MainHubUpgradeV001ForCalendarView />} />
          <Route path="/*" element={<MainHubUpgradeV001ForSisterUnionRoutes />} />
        </Routes>
        
        {!isLoading && <MainHubUpgradeV001ForUminionMainHub />}

        {isProfileModalOpen && (
          <div className="absolute inset-0 z-40 bg-black/50">
            <MainHubUpgradeV001ForMyProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              onOpenAuthModal={handleOpenAuthModal}
            />
          </div>
        )}
      </main>

      {/* 
        PHP Conversion Instructions:
        This footer can be converted into a `footer.php` file.
        The buttons would be standard HTML `<button>` elements. The countdown logic would be managed in a global `main.js` file,
        which would then trigger the display of the uHub modal `<div>`.
      */}
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
          <Button>Main-Hub</Button>
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

// The main App component that sets up the router.
function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
