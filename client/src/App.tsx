
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import UminionMainHubVersion001 from '@/features/uminion/UminionMainHubVersion001';
import CalendarView from '@/features/calendar/CalendarView';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-zinc-900 text-foreground">
      <header className="p-4 border-b border-border/50 shadow-lg">
        <div className="container mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center mb-4">Welcome to the Union</h1>
          <div className="flex items-end gap-4 self-start">
            <Button disabled className="bg-orange-400 hover:bg-orange-500 text-black">Submit</Button>
            <div>
              {isLoading ? (
                <span id="loading-text">loading...</span>
              ) : (
                <UminionMainHubVersion001 />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <CalendarView />
      </main>

      <footer className="p-4 border-t border-border/50 shadow-lg">
        <div className="container mx-auto flex justify-center items-center relative">
          <p className="text-lg">Please Come Again!</p>
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

export default App;
