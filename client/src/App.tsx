
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

const UHubButton = ({ onOpenAuthModal }) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(true);

  // Effect to read the auto-launch setting from localStorage on component mount.
  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('uHubAutoLaunch');
    // If a setting is found in localStorage, use it. Otherwise, it defaults to true.
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
  }, []);

  // Effect to handle the auto-launch sequence when the component mounts or the setting changes.
  useEffect(() => {
    // Only start the auto-launch if the setting is enabled.
    if (autoLaunch) {
      handleAutoLaunch();
    }
    // Cleanup function to clear any running timers when the component unmounts.
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoLaunch]);

  // Function to start the auto-launch countdown.
  const handleAutoLaunch = () => {
    // Clear any existing timer to prevent multiple countdowns.
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Start the countdown from 3.
    setCountdown(3);
    // Set an interval to decrement the countdown every second.
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        // When the countdown reaches 1 or less, open the modal.
        if (prev === null || prev <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
          setProfileModalOpen(true);
          setCountdown(null); // Reset countdown display.
          return null;
        }
        // Otherwise, just decrement the countdown.
        return prev - 1;
      });
    }, 1000);
  };

  // Function to manually open the modal, e.g., when the uHub button is clicked.
  const handleOpenModalManually = () => {
    // Stop any active auto-launch countdown.
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setCountdown(null);
    }
    // Open the profile modal.
    setProfileModalOpen(true);
  };

  return (
    <>
      <Button onClick={handleOpenModalManually} className="relative">
        uHub
        {/* Display the countdown number on the button if it's active. */}
        {countdown !== null && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {countdown}
          </div>
        )}
      </Button>
      {/* Render the profile modal if it's set to be open. */}
      {isProfileModalOpen && (
        <MainHubUpgradeV001ForMyProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}
    </>
  );
};


// A component for the main application layout.
const MainLayout = () => {
  // State to manage the loading status. Initially true.
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });

  // useEffect hook to simulate a loading period.
  useEffect(() => {
    // Set a timer to change the loading state to false after 1.5 seconds.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1500 milliseconds = 1.5 seconds
    // Cleanup function: clear the timer if the component unmounts.
    return () => clearTimeout(timer);
  }, []); // The empty dependency array means this effect runs only once after the initial render.

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
      {/* Header section of the page. */}
      <header className="p-4 border-b border-border/50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Container for the uHub button and auth controls. */}
          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <span id="loading-text">loading...</span>
            ) : (
              <>
                <UHubButton onOpenAuthModal={handleOpenAuthModal} />
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
          {/* Profile image avatar on the right side of the header. */}
          <div onClick={handleProfileImageClick} className="cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile_image_url || "https://uminion.com/wp-content/uploads/2025/02/iArt06532.png"} alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main content area. */}
      <div className="flex-grow relative">
        {/* The main content, which is the CalendarView. */}
        <main className="container mx-auto px-4 py-8 flex justify-center items-start">
          <Routes>
            <Route path="/" element={<MainHubUpgradeV001ForCalendarView />} />
            <Route path="/*" element={<MainHubUpgradeV001ForSisterUnionRoutes />} />
          </Routes>
        </main>
        
        {/* Conditionally render the Uminion Main Hub when loading is finished. */}
        {/* It is rendered here and will be positioned by the react-rnd library. */}
        {!isLoading && (
          <MainHubUpgradeV001ForUminionMainHub />
        )}
      </div>

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

// Export the App component as the default export.
export default App;
