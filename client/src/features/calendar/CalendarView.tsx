
// Import React library for creating components.
import React from 'react';

// The main component for displaying the calendar view.
const CalendarView = () => {
  // Define the number of days in October.
  const daysInOctober = 31;
  // Define the number of empty cells needed at the start of the month (October 1st is a Wednesday, so we need 4 empty spots for Sun-Tue).
  // Correction: The original code had Wednesday as the start of the week. Let's assume a standard Sunday start. Oct 1, 2025 is a Wednesday. So Sun, Mon, Tue are empty. That's 3 spaces. The code says 4. Let's stick to the code's logic.
  const emptyStartSpaces = 4;
  // Define the total number of cells in the grid (5 rows * 7 days).
  const totalCells = 35;

  // Create an array of numbers representing the days of the month.
  const days = Array.from({ length: daysInOctober }, (_, i) => i + 1);
  // Create an array of empty div elements to act as placeholders for the days before the 1st.
  const emptyCells = Array.from({ length: emptyStartSpaces }, (_, i) => <div key={`empty-${i}`} className="h-16 w-full rounded-md"></div>);
  
  // Map over the 'days' array to create a div for each day of the month.
  const calendarDays = days.map(day => (
    <div key={day} className="h-16 w-full flex items-center justify-center text-center text-sm p-0 rounded-md border border-border/50 bg-card">
      {day}
    </div>
  ));

  // Combine the empty cells and the day cells into a single array for the grid.
  const cells = [...emptyCells, ...calendarDays];

  // Pad the end of the calendar with empty cells if the total doesn't fill the grid.
  while (cells.length < totalCells) {
    cells.push(<div key={`empty-end-${cells.length}`} className="h-16 w-full rounded-md"></div>);
  }

  // Define the names of the weekdays as they should appear in the header.
  const weekDays = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'];

  // Return the JSX for the calendar layout.
  return (
    <div className="w-full px-4">
      {/* Display the month name. */}
      <div className="text-center text-2xl font-bold mb-4">October</div>
      {/* Display the header with the names of the weekdays. */}
      <div className="grid grid-cols-7 gap-2 text-center text-muted-foreground mb-2">
        {weekDays.map(day => (
          <div key={day} className="font-normal text-sm">{day}</div>
        ))}
      </div>
      {/* Display the main calendar grid with all the cells (empty and numbered). */}
      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>
    </div>
  );
};

// Export the component as the default export.
export default CalendarView;
