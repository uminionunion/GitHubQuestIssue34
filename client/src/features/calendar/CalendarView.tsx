
import React from 'react';
import { Calendar } from '@/components/ui/calendar';

const CalendarView = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2024, 9, 1));

  return (
    <div className="flex justify-center items-center py-8">
      <Calendar
        month={new Date(2024, 9, 1)}
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        classNames={{
          caption_label: "text-lg",
          head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
          cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
        }}
      />
    </div>
  );
};

export default CalendarView;
