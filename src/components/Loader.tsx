import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-12 w-12 text-brand-primary animate-spin mb-4" />
      <p className="text-brand-text text-lg">Loading mint information...</p>
    </div>
  );
};

export default Loader;