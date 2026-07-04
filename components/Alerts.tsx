import React from 'react';

/**
 * Loading Spinner Component
 * Shows a loading indicator
 */
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

/**
 * Error Alert Component
 * Shows error messages
 */
export const ErrorAlert: React.FC<{ message: string; onClose?: () => void }> = ({
  message,
  onClose,
}) => {
  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-700 hover:text-red-900">
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * Success Message Component
 * Shows success notifications
 */
export const SuccessAlert: React.FC<{ message: string; onClose?: () => void }> = ({
  message,
  onClose,
}) => {
  return (
    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-green-700 hover:text-green-900">
          ✕
        </button>
      )}
    </div>
  );
};
