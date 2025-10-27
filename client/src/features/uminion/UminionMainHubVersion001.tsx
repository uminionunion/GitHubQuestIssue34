
// Import React library for creating components.
import React from 'react';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';

// A reusable component for the numbered buttons around the hub.
const UminionButton = ({ number }: { number: number }) => {
  // Determine if the button should be orange or black based on its number.
  // Buttons with odd numbers (1, 3, 5...) are orange.
  const isOrange = (number - 1) % 2 === 0;
  // Set the button's background color class based on the 'isOrange' flag.
  const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';
  // Return the Button component with specific styles.
  return (
    <Button
      className={`${buttonColor} text-white w-12 h-8 text-xs p-1`}
    >
      {/* Display the button number, padded with a leading zero if it's a single digit. */}
      #{String(number).padStart(2, '0')}
    </Button>
  );
};

// The main component for the Uminion Hub.
const UminionMainHubVersion001 = () => {
  // Return the JSX for the main hub layout.
  return (
    <div
      className="w-[600px] h-[300px] bg-zinc-300 border border-border/50 rounded-lg flex items-center justify-center relative p-2"
      aria-label="main hub"
    >
      {/* Container for the top row of buttons (#01 to #06). */}
      <div className="absolute top-2 left-2 right-2 flex justify-between">
        {/* Create an array of numbers from 1 to 6 and map over it to render UminionButton components. */}
        {[1, 2, 3, 4, 5, 6].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Container for the right column of buttons (#07 to #12). */}
      <div className="absolute right-2 top-12 bottom-12 flex flex-col justify-between">
        {/* Create an array of numbers from 7 to 12 and map over it to render UminionButton components. */}
        {[7, 8, 9, 10, 11, 12].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Container for the bottom row of buttons (#13 to #18). */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        {/* Create an array of numbers from 18 down to 13 and map over it to render UminionButton components. */}
        {/* This order places #18 on the left and #13 on the right. */}
        {[18, 17, 16, 15, 14, 13].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Container for the left column of buttons (#19 to #24). */}
      <div className="absolute left-2 top-12 bottom-12 flex flex-col justify-between flex-col-reverse">
        {/* Create an array of numbers from 19 to 24 and map over it to render UminionButton components. */}
        {/* 'flex-col-reverse' is used to order them from bottom to top. */}
        {[19, 20, 21, 22, 23, 24].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* The central text of the hub. */}
      <span className="text-2xl font-bold text-black">Main hub</span>
    </div>
  );
};

// Export the component as the default export.
export default UminionMainHubVersion001;
