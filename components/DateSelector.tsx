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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            title="Previous day"
          >
            ← Previous
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600">Selected Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            title="Next day"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateInputChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
