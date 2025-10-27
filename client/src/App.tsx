
// Import React and hooks like useState and useEffect.
import React, { useState, useEffect } from 'react';
// Import routing components from react-router-dom.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';
// Import the Uminion Main Hub component.
import UminionMainHubVersion001 from '@/features/uminion/UminionMainHubVersion001';
// Import the Calendar View component.
import CalendarView from '@/features/calendar/CalendarView';
// Import the Sister Union routes.
import SisterUnionRoutes from '@/features/uminion/SisterUnionRoutes';

// A component for the main application layout.
const MainLayout = () => {
  // State to manage the loading status. Initially true.
  const [isLoading, setIsLoading] = useState(true);

  // useEffect hook to simulate a loading period.
  useEffect(() => {
    // Set a timer to change the loading state to false after 1.5 seconds.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1500 milliseconds = 1.5 seconds
    // Cleanup function: clear the timer if the component unmounts.
    return () => clearTimeout(timer);
  }, []); // The empty dependency array means this effect runs only once after the initial render.

  // Function to scroll the window to the top smoothly.
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      {/* Header section of the page. */}
      <header className="p-4 border-b border-border/50 shadow-lg">
        <div className="container mx-auto flex flex-col items-center">
          {/* Main title. */}
          <h1 className="text-4xl font-bold text-center mb-4">Welcome to the Union</h1>
          {/* Container for the submit button and loading text. */}
          <div className="flex items-center gap-4 self-start">
            {/* A disabled submit button. */}
            <Button disabled className="bg-orange-400 hover:bg-orange-500 text-black">Submit</Button>
            {/* Conditionally render the loading text if isLoading is true. */}
            {isLoading && <span id="loading-text">loading...</span>}
          </div>
        </div>
      </header>

      {/* Main content area. */}
      <div className="flex-grow relative">
        {/* The main content, which is the CalendarView. */}
        <main className="container mx-auto px-4 py-8 flex justify-center items-start">
          <Routes>
            <Route path="/" element={<CalendarView />} />
            <Route path="/*" element={<SisterUnionRoutes />} />
          </Routes>
        </main>
        
        {/* Conditionally render the Uminion Main Hub when loading is finished. */}
        {/* It is rendered here and will be positioned by the react-rnd library. */}
        {!isLoading && (
          <UminionMainHubVersion001 />
        )}
      </div>

      {/* Footer section of the page. */}
      <footer className="p-4 border-t border-border/50 shadow-lg mt-auto">
        <div className="container mx-auto flex justify-center items-center relative">
          {/* A friendly message. */}
          <p className="text-lg">Please Come Again!</p>
          {/* A button to scroll back to the top, positioned at the bottom right of the footer. */}
          <div className="absolute bottom-0 right-0">
            <Button variant="link" onClick={scrollToTop} className="text-orange-400">
              back to the top?
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// The main App component that sets up the router.
function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

// Export the App component as the default export.
export default App;
