
// Import React and hooks like useState and useEffect.
import React, { useState, useEffect } from 'react';
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

// A component for the main application layout.
const MainLayout = () => {
  // State to manage the loading status. Initially true.
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      {/* Header section of the page. */}
      <header className="p-4 border-b border-border/50 shadow-lg">
        <div className="container mx-auto flex flex-col items-center">
          {/* Container for the submit button and loading text. */}
          <div className="flex items-center gap-4 self-start">
            {isAuthLoading ? (
              <span id="loading-text">loading...</span>
            ) : user ? (
              <>
                <Button onClick={() => setProfileModalOpen(true)}>My Profile</Button>
                <Button onClick={handleLogout} variant="destructive">Log Out</Button>
              </>
            ) : (
              <>
                <span className="mr-2">MainHubUpgradeV001ForLoading002</span>
                <Button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="bg-orange-400 hover:bg-orange-500 text-black">Sign Up?</Button>
                <Button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}>Log In?</Button>
                <Button onClick={() => setProfileModalOpen(true)}>MyProfile</Button>
              </>
            )}
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
        />
      )}
      {isProfileModalOpen && (
        <MainHubUpgradeV001ForMyProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
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
