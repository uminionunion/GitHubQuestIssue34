
// Import React library and hooks for creating components.
import React, { useState } from 'react';
// Import the Rnd component for draggable and resizable functionality.
import { Rnd } from 'react-rnd';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';

// A reusable component for the numbered buttons around the hub.
const UminionButton = ({ number, containerSize }: { number: number; containerSize: { width: number; height: number } }) => {
  // Determine if the button should be orange or black based on its number.
  // Buttons with odd numbers (1, 3, 5...) are orange.
  const isOrange = (number - 1) % 2 === 0;
  // Set the button's background color class based on the 'isOrange' flag.
  const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';

  // Calculate button dimensions and font size based on the container's size.
  const buttonWidth = Math.max(20, containerSize.width / 15);
  const buttonHeight = Math.max(15, containerSize.height / 8);
  const fontSize = Math.max(8, containerSize.width / 75);

  // Return the Button component with dynamic styles.
  return (
    <Button
      className={`${buttonColor} text-white p-1`}
      style={{
        width: `${buttonWidth}px`,
        height: `${buttonHeight}px`,
        fontSize: `${fontSize}px`,
      }}
    >
      {/* Display the button number, padded with a leading zero if it's a single digit. */}
      #{String(number).padStart(2, '0')}
    </Button>
  );
};

// The main component for the Uminion Hub.
const UminionMainHubVersion001 = () => {
  // State to hold the size of the Rnd component.
  const [size, setSize] = useState({ width: 600, height: 150 });

  // Return the JSX for the main hub layout, wrapped in the Rnd component.
  return (
    <Rnd
      // Default size and position of the component.
      default={{
        x: (window.innerWidth - 600) / 2, // Center horizontally
        y: 100, // Position from the top
        width: 600,
        height: 150,
      }}
      // Update the size state on resize.
      onResize={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      // Minimum dimensions to prevent it from becoming too small.
      minWidth={300}
      minHeight={100}
      // Class to apply to the handle for dragging.
      dragHandleClassName="drag-handle"
      // Bounds the dragging area to the parent element.
      bounds="parent"
    >
      <div
        className="w-full h-full bg-zinc-300 border border-border/50 rounded-lg flex items-center justify-center relative p-2 drag-handle"
        aria-label="main hub"
      >
        {/* Container for the top row of buttons (#01 to #06). */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          {[1, 2, 3, 4, 5, 6].map(n => <UminionButton key={n} number={n} containerSize={size} />)}
        </div>

        {/* Container for the right column of buttons (#07 to #12). */}
        <div className="absolute right-2 flex flex-col justify-between" style={{ top: `${size.height / 5}px`, bottom: `${size.height / 5}px` }}>
          {[7, 8, 9, 10, 11, 12].map(n => <UminionButton key={n} number={n} containerSize={size} />)}
        </div>

        {/* Container for the bottom row of buttons (#13 to #18). */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          {[18, 17, 16, 15, 14, 13].map(n => <UminionButton key={n} number={n} containerSize={size} />)}
        </div>

        {/* Container for the left column of buttons (#19 to #24). */}
        <div className="absolute left-2 flex flex-col justify-between flex-col-reverse" style={{ top: `${size.height / 5}px`, bottom: `${size.height / 5}px` }}>
          {[19, 20, 21, 22, 23, 24].map(n => <UminionButton key={n} number={n} containerSize={size} />)}
        </div>

        {/* The central text of the hub. */}
        <span className="text-2xl font-bold text-black" style={{ fontSize: `${Math.max(16, size.width / 25)}px` }}>Main hub</span>
      </div>
    </Rnd>
  );
};

// Export the component as the default export.
export default UminionMainHubVersion001;
