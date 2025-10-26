
import React from 'react';
import { Button } from '@/components/ui/button';

const UminionMainHubVersion001 = () => {
  const renderButtons = (count: number, start: number, position: 'top' | 'bottom' | 'left' | 'right') => {
    const buttons = [];
    for (let i = 0; i < count; i++) {
      const number = start + i;
      const isOrange = i % 2 === 0;
      const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';
      buttons.push(
        <Button
          key={number}
          className={`${buttonColor} text-white w-12 h-8 text-xs`}
        >
          #{String(number).padStart(2, '0')}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div
      className="w-[600px] h-[200px] bg-zinc-300 border border-border/50 rounded-lg flex items-center justify-center relative p-4"
      aria-label="main hub"
    >
      {/* Top Buttons */}
      <div className="absolute top-2 left-0 right-0 flex justify-center gap-2">
        {renderButtons(6, 1, 'top')}
      </div>

      {/* Bottom Buttons */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {renderButtons(6, 7, 'bottom')}
      </div>

      {/* Left Buttons */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-2">
        {renderButtons(6, 13, 'left')}
      </div>

      {/* Right Buttons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-2">
        {renderButtons(6, 19, 'right')}
      </div>

      <span className="text-2xl font-bold text-black">Main hub</span>
    </div>
  );
};

export default UminionMainHubVersion001;
