import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  retryFn?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, retryFn }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Error Loading Mint Info</h2>
      <p className="text-brand-text mb-4">{message}</p>
      {retryFn && (
        <button
          onClick={retryFn}
          className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-light transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;