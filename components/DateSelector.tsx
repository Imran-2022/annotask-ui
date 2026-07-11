'use client';

import React from 'react';
import { format } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onDateChange(date);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <label className="sr-only" htmlFor="task-date">
        Select date
      </label>
      <div className="flex items-center gap-2 border px-2">
        <input
          id="task-date"
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateInputChange}
          className="border-none bg-transparent text-sm outline-none"
        />
      </div>
      <button
        onClick={handleToday}
        className="border px-4 py-2 text-sm font-semibold"
      >
        Today
      </button>
    </div>
  );
};
