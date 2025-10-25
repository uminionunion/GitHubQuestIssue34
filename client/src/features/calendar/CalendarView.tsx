
import React from 'react';

const CalendarView = () => {
  const daysInOctober = 31;
  const emptyStartSpaces = 4;
  const totalCells = 35; // 5 rows * 7 days

  const days = Array.from({ length: daysInOctober }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: emptyStartSpaces }, (_, i) => <div key={`empty-${i}`} className="h-16 w-full rounded-md"></div>);
  
  const calendarDays = days.map(day => (
    <div key={day} className="h-16 w-full flex items-center justify-center text-center text-sm p-0 rounded-md border border-border/50 bg-card">
      {day}
    </div>
  ));

  const cells = [...emptyCells, ...calendarDays];

  // Pad with empty cells at the end if needed, though for Oct with 4 start spaces, it's exactly 35
  while (cells.length < totalCells) {
    cells.push(<div key={`empty-end-${cells.length}`} className="h-16 w-full rounded-md"></div>);
  }

  const weekDays = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'];

  return (
    <div className="w-full px-4">
      <div className="text-center text-2xl font-bold mb-4">October</div>
      <div className="grid grid-cols-7 gap-2 text-center text-muted-foreground mb-2">
        {weekDays.map(day => (
          <div key={day} className="font-normal text-sm">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>
    </div>
  );
};

export default CalendarView;
