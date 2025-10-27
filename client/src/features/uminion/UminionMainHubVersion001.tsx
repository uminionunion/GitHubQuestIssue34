
// Import React library for creating components.
import React from 'react';
// Import the Rnd component for draggable and resizable functionality.
import { Rnd } from 'react-rnd';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';

// A reusable component for the numbered buttons around the hub.
const UminionButton = ({ number, size }: { number: number; size: { width: number; height: number } }) => {
  // Determine if the button should be orange or black based on its number.
  // Buttons with odd numbers (1, 3, 5...) are orange.
  const isOrange = (number - 1) % 2 === 0;
  // Set the button's background color class based on the 'isOrange' flag.
  const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';

  // Calculate button dimensions and font size based on the container's size.
  const buttonWidth = Math.max(20, size.width / 15);
  const buttonHeight = Math.max(15, size.height / 6);
  const fontSize = Math.max(8, size.width / 75);

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
        {/* The central text of the hub. */}
        <span className="text-2xl font-bold text-black">Main hub</span>
      </div>
    </Rnd>
  );
};

// Export the component as the default export.
export default UminionMainHubVersion001;
