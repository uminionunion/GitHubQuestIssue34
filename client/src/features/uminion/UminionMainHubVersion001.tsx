
import React from 'react';
import { Button } from '@/components/ui/button';

const UminionButton = ({ number }: { number: number }) => {
  const isOrange = (number - 1) % 2 === 0;
  const buttonColor = isOrange ? 'bg-orange-400 hover:bg-orange-500' : 'bg-black hover:bg-zinc-800';
  return (
    <Button
      className={`${buttonColor} text-white w-12 h-8 text-xs p-1`}
    >
      #{String(number).padStart(2, '0')}
    </Button>
  );
};

const UminionMainHubVersion001 = () => {
  return (
    <div
      className="w-[600px] h-[300px] bg-zinc-300 border border-border/50 rounded-lg flex items-center justify-center relative p-2"
      aria-label="main hub"
    >
      {/* Top Buttons (#01 to #06) */}
      <div className="absolute top-2 left-2 right-2 flex justify-between">
        {[1, 2, 3, 4, 5, 6].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Right Buttons (#07 to #12) */}
      <div className="absolute right-2 top-12 bottom-12 flex flex-col justify-between">
        {[7, 8, 9, 10, 11, 12].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Bottom Buttons (#13 to #18) */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between flex-row-reverse pl-14 pr-14">
        {[13, 14, 15, 16, 17, 18].map(n => <UminionButton key={n} number={n} />)}
      </div>

      {/* Left Buttons (#19 to #24) */}
      <div className="absolute left-2 top-12 bottom-12 flex flex-col justify-between flex-col-reverse">
        {[19, 20, 21, 22, 23, 24].map(n => <UminionButton key={n} number={n} />)}
      </div>

      <span className="text-2xl font-bold text-black">Main hub</span>
    </div>
  );
};

export default UminionMainHubVersion001;
