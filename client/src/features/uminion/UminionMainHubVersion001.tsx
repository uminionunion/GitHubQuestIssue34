
// Import React library and hooks for creating components.
import React, { useState } from 'react';
// Import the Rnd component for draggable and resizable functionality.
import { Rnd } from 'react-rnd';
// Import the Button component from the UI library.
import { Button } from '@/components/ui/button';
// Import the ChatModal component.
import ChatModal from './ChatModal';
// Import the useNavigate hook for navigation.
import { useNavigate } from 'react-router-dom';

// An array of page names for the Sister Unions.
const sisterUnionPages = [
  'SisterUnion001NewEngland', 'SisterUnion002CentralEastCoast', 'SisterUnion003SouthEast',
  'SisterUnion004TheGreatLakesAndAppalachia', 'SisterUnion005CentralSouth', 'SisterUnion006CentralNorth',
  'SisterUnion007SouthWest', 'SisterUnion008NorthWest', 'SisterUnion009International',
  'SisterUnion010TheGreatHall', 'SisterUnion011WaterFall', 'SisterUnion012UnionEvent',
  'SisterUnion013UnionSupport', 'SisterUnion014UnionNews', 'SisterUnion015UnionRadio',
  'SisterUnion016UnionDrive', 'SisterUnion017UnionArchiveAndEducation', 'SisterUnion018UnionTech',
  'SisterUnion019UnionPolitic', 'SisterUnion020UnionSAM', 'SisterUnion021UnionUkraineAndTheCrystalPalace',
  'SisterUnion022FestyLove', 'SisterUnion023UnionLegal', 'SisterUnion024UnionMarket',
];

// Generate a list of 24 distinct background colors.
const modalColors = Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 80%)`);

// A reusable component for the numbered buttons around the hub.
const UminionButton = ({
  number,
  containerSize,
  onClick,
  style,
}: {
  number: number;
  containerSize: { width: number; height: number };
  onClick: () => void;
  style?: React.CSSProperties;
}) => {
  // Determine if the button should be orange or black based on its number.
  const isOrange = (number - 1) % 2 === 0;
  // Set the button's background color class based on the 'isOrange' flag.
  const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';

  // Calculate button dimensions and font size based on the container's size.
  const buttonWidth = style?.width || Math.max(20, containerSize.width / 15);
  const buttonHeight = style?.height || Math.max(15, containerSize.height / 10);
  const fontSize = Math.max(8, containerSize.width / 75);

  // Return the Button component with dynamic styles.
  return (
    <Button
      onClick={onClick}
      className={`${buttonColor} text-white p-1`}
      style={{
        width: `${buttonWidth}px`,
        height: `${buttonHeight}px`,
        fontSize: `${fontSize}px`,
        ...style,
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
  // State to manage which modal is open.
  const [activeModal, setActiveModal] = useState<number | null>(null);
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // Function to handle button clicks.
  const handleButtonClick = (buttonNumber: number) => {
    const pageName = sisterUnionPages[buttonNumber - 1];
    // Navigate to the corresponding page.
    navigate(`/${pageName}`);
    // Open the modal for the clicked button.
    setActiveModal(buttonNumber);
  };

  const topAndBottomButtonHeight = Math.max(15, size.height / 10);
  const sideButtonContainerPadding = topAndBottomButtonHeight + 8; // 8 is for top-2 (4px) + gap

  const horizontalButtonWidth = (size.width - 4 * 2) / 6; // 4px padding on each side

  const verticalAvailableHeight = size.height - (2 * sideButtonContainerPadding);
  const sideButtonHeight = verticalAvailableHeight > 0 ? verticalAvailableHeight / 6 : 0;

  return (
    <>
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
          className="w-full h-full bg-zinc-300 border border-border/50 rounded-lg flex items-center justify-center relative p-2 drag-handle bg-cover bg-center"
          style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}
          aria-label="main hub"
        >
          {/* Container for the top row of buttons (#01 to #06). */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            {[1, 2, 3, 4, 5, 6].map(n => <UminionButton key={n} number={n} containerSize={size} onClick={() => handleButtonClick(n)} style={{ width: `${horizontalButtonWidth}px` }} />)}
          </div>

          {/* Container for the right column of buttons (#07 to #12). */}
          <div className="absolute right-2 flex flex-col" style={{ top: `${sideButtonContainerPadding}px`, bottom: `${sideButtonContainerPadding}px` }}>
            {[7, 8, 9, 10, 11, 12].map(n => <UminionButton key={n} number={n} containerSize={size} onClick={() => handleButtonClick(n)} style={{ height: `${sideButtonHeight}px` }} />)}
          </div>

          {/* Container for the bottom row of buttons (#13 to #18). */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between">
            {[18, 17, 16, 15, 14, 13].map(n => <UminionButton key={n} number={n} containerSize={size} onClick={() => handleButtonClick(n)} style={{ width: `${horizontalButtonWidth}px` }} />)}
          </div>

          {/* Container for the left column of buttons (#19 to #24). */}
          <div className="absolute left-2 flex flex-col" style={{ top: `${sideButtonContainerPadding}px`, bottom: `${sideButtonContainerPadding}px` }}>
            {[24, 23, 22, 21, 20, 19].map(n => <UminionButton key={n} number={n} containerSize={size} onClick={() => handleButtonClick(n)} style={{ height: `${sideButtonHeight}px` }} />)}
          </div>

          {/* The central text of the hub. */}
          <span className="text-2xl font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded relative" style={{ fontSize: `${Math.max(16, size.width / 25)}px`, bottom: '25px' }}>Main Hub</span>
        </div>
      </Rnd>

      {/* Render the ChatModal if a modal is active. */}
      {activeModal !== null && (
        <ChatModal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          pageName={sisterUnionPages[activeModal - 1]}
          backgroundColor={modalColors[activeModal - 1]}
          modalNumber={activeModal}
        />
      )}
    </>
  );
};

// Export the component as the default export.
export default UminionMainHubVersion001;
