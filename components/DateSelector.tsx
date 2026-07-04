'use client';

import React from 'react';
import { format, addDays, subDays } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onDateChange(date);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            onClick={handlePrevDay}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-4 rounded-3xl bg-slate-100 px-4 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Selected Date</p>
              <p className="text-xl font-semibold text-slate-900">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          <button
            onClick={handleNextDay}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100"
          >
            Next →
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateInputChange}
              className="bg-transparent text-sm font-medium outline-none"
            />
          </div>
          <button
            onClick={handleToday}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
