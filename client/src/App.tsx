
// FILE: client/src/App.tsx
// =================================================================================================
//
// This file is the root component of the React application. It sets up the main structure,
// including routing, authentication context, and the overall layout (header, main content, footer).
//
// Main Features:
// -   **Routing**: Uses `react-router-dom` to manage client-side navigation. It defines the
//     main routes for the application, such as the home page and the Sister Union pages.
// -   **Authentication**: Wraps the application in an `AuthProvider` to provide authentication
//     state (like the current user) to all child components. It handles showing login/signup
//     buttons or a logout button based on the user's status.
// -   **Layout**: Defines the main layout with a header, a main content area, and a footer.
// -   **Modal Management**: Controls the visibility of the primary modals, including the
//     authentication modal (`AuthModal`) and the main user hub (`MainHubUpgradeV001ForMyProfileModal`).
//
// State Management (React Hooks):
// -   `useState` is used to manage the visibility and state of modals (e.g., `authModal`, `isProfileModalOpen`).
// -   `useEffect` is used for side effects, such as setting a loading timer and managing the
//     auto-launch countdown for the uHub.
// -   `useRef` is used to hold a reference to the countdown timer to clear it when needed.
// -   `useAuth` custom hook is used to access user data and authentication functions (`login`, `logout`).
//
// CSS Styling:
// -   Styling is done using Tailwind CSS classes applied via the `className` prop.
// -   The main layout uses Flexbox (`flex`, `flex-col`) to structure the header, main, and footer.
// -   The background is a gradient defined with Tailwind's `from-` and `to-` utility classes.
//
// Backend/Server Connection (Express.js):
// -   The `logout` function makes a POST request to `/api/auth/logout`.
// -   The `AuthModal` component (used here) handles the login/signup API calls.
// -   The server-side logic for these authentication routes is in `server/auth.ts`.
//
// ---
//
// PHP & MySQL Conversion Guide:
//
// To convert this component to a traditional PHP/MySQL stack:
//
// 1.  **File Structure**:
//     -   This file's layout logic would be split into `header.php`, `footer.php`, and a main layout file (e.g., `index.php`).
//     -   `index.php` would be the main entry point, including the header and footer, and then including the content for the specific page requested via a URL parameter (e.g., `index.php?page=home`).
//
// 2.  **Backend (PHP & MySQL)**:
//     -   **Routing**: Instead of `react-router-dom`, you'd use server-side routing. A simple `switch` statement in `index.php` based on `$_GET['page']` would determine which template to load.
//     -   **Authentication**: The `useAuth` hook would be replaced by PHP sessions.
//         -   In `header.php`, you would check `if (isset($_SESSION['user_id']))` to decide whether to show the user's avatar and a "Logout" link, or "Login" and "Sign Up" links.
//         -   The "Logout" link would point to `logout.php`, which calls `session_destroy()`.
//
// 3.  **Frontend (HTML, CSS, JavaScript)**:
//     -   **Layout**: The JSX for the header, main, and footer would be converted to plain HTML in `header.php` and `footer.php`.
//     -   **Modal Management**: The logic for opening and closing modals would be handled in a global JavaScript file (e.g., `assets/js/main.js`).
//         -   The modals themselves (`AuthModal`, `MainHubUpgradeV001ForMyProfileModal`) would be HTML `<div>`s (defined in included PHP files like `templates/auth_modal.php`) that are hidden by default (`display: none;`).
//         -   JavaScript event listeners on buttons (`document.getElementById('login-btn').addEventListener('click', ...)` would change the modal's style to `display: block;`.
//     -   **Countdown Timer**: The `useEffect` for the countdown would be replicated in `main.js` using `setInterval` and `setTimeout` to update the text content of a `<span>` in the footer.
//
// 4.  **Database (MySQL)**:
//     -   No direct database interaction in this file, but the components it uses (like `MainHubUpgradeV001ForMyProfileModal`) would rely on data fetched from a MySQL database via PHP.
//
// =================================================================================================

import React, { useState, useEffect, useRef } from 'react';
// Import routing components from react-router-dom.
// PHP Conversion: This is React's client-side router. In PHP, routing is typically handled on the server-side. A common approach is using a single entry point (e.g., `index.php`) with a URL parameter (`?page=...`) or a more advanced router that uses `.htaccess` to create clean URLs.
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Import the Button component from the UI library.
// PHP Conversion: This is a reusable React component. In PHP, this would be a PHP function `render_button('text', 'class')` in `functions.php` that echoes HTML, or simply a styled `<button>` tag in your template files.
import { Button } from '@/components/ui/button';
// Import the Sister Union routes.
// PHP Conversion: This component defines multiple routes. In PHP, this logic would be inside your main router (`index.php`) to include the correct page template.
import MainHubUpgradeV001ForSisterUnionRoutes from '@/features/uminion/MainHubUpgradeV001ForSisterUnionRoutes';
// Import authentication context and hooks.
// PHP Conversion: This handles client-side user state. In PHP, you would use `$_SESSION` variables to manage user login state across pages.
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
// Import the authentication modal.
// PHP Conversion: This would be a `auth_modal.php` template, included in the main layout and shown/hidden with JavaScript.
import AuthModal from './features/auth/AuthModal';
// Import the user profile modal (uHub).
// PHP Conversion: This is the main uHub modal. It would be a large `uhub.php` template, included in the main layout and controlled by JavaScript (`uhub.js`).
import MainHubUpgradeV001ForMyProfileModal from './features/profile/MainHubUpgradeV001ForMyProfileModal';
// Import the Avatar component.
// PHP Conversion: A styled `<img>` tag inside a `<div>`.
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// A component for the main application layout.
const MainLayout = () => {
  // State to manage the loading status. Initially true.
  // PHP Conversion: Loading states are client-side concepts. You might show a loading spinner with JS while waiting for an AJAX call to complete.
  const [isLoading, setIsLoading] = useState(true);
  // State for user authentication, modals, and hub visibility.
  // PHP Conversion: `user` would be a PHP variable from `$_SESSION`. Modal visibility (`authModal`, `isProfileModalOpen`) would be managed by JavaScript variables in `main.js`.
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(true);

  // Effect to read the auto-launch setting from localStorage on component mount.
  // PHP Conversion: `localStorage` is a browser feature. This logic would be in `main.js`, using `localStorage.getItem('uHubAutoLaunch')`.
  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('uHubAutoLaunch');
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
  }, []);

  // Effect to handle the auto-launch sequence.
  // PHP Conversion: This logic would be in `main.js`, using `setTimeout` and `setInterval` to manage the countdown and show the uHub modal `<div>`.
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

  // PHP Conversion: These `handle` functions would be plain JavaScript functions in `main.js`.
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
      setProfileModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      {/* 
        PHP Conversion Instructions:
        This header would be a `header.php` file included at the top of every page.
        The user authentication status (`user` object) would be determined by checking `isset($_SESSION['user_id'])`.
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
        (e.g., `welcome.php`, `sister_union_page.php`) based on a URL parameter like `?page=...`.
        The uHub modal would be an absolutely positioned `<div>` inside this container, with its visibility toggled by JavaScript.
      */}
      <main className="flex-grow relative container mx-auto px-4 py-8 flex justify-center items-start">
        <Routes>
          <Route path="/" element={
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to the uminion</h1>
              <p className="text-lg text-muted-foreground">Click the uHub button below to get started.</p>
              <Link to="/SisterUnion001NewEngland">
                <Button className="mt-4">Go to a Sister Union Page</Button>
              </Link>
            </div>
          } />
          <Route path="/*" element={<MainHubUpgradeV001ForSisterUnionRoutes />} />
        </Routes>
        
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
        This footer would be a `footer.php` file included at the bottom of every page.
        The buttons would be standard HTML `<button>` elements. Their `onclick` handlers would be defined in `main.js`.
        The countdown logic would also be in `main.js`, updating the DOM to show the countdown number.
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
