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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <label className="sr-only" htmlFor="task-date">
        Select date
      </label>
      <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          id="task-date"
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateInputChange}
          className="w-full bg-transparent text-sm font-medium outline-none"
        />
      </div>
      <button
        onClick={handleToday}
        className="inline-flex h-11 items-center justify-center rounded-full bg-fuchsia-600 px-5 text-sm font-semibold text-white transition hover:bg-fuchsia-700"
      >
        Today
      </button>
    </div>
  );
};
