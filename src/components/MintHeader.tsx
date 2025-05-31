import React from 'react';
import { MintInfo } from '../types';
import { Bitcoin } from 'lucide-react';

interface MintHeaderProps {
  mintInfo: MintInfo;
}

const MintHeader: React.FC<MintHeaderProps> = ({ mintInfo }) => {
  const showIcon = import.meta.env.VITE_ENABLE_ICON === 'true';
  const iconUrl = mintInfo.icon || mintInfo.icon_url;

  return (
    <div className="flex items-center justify-center py-6 mb-8">
      <div className="flex items-center flex-col">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 bg-gray-800 flex items-center justify-center border-4 border-brand-primary shadow-lg">
          {showIcon && iconUrl ? (
            <img 
              src={iconUrl} 
              alt={`${mintInfo.name} Logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Bitcoin className="h-12 w-12 text-brand-primary animate-pulse-slow" />
          )}
        </div>
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-primary mb-2">
            {mintInfo.name || 'Unknown Mint'}
          </h1>
          <p className="text-xl text-brand-text">
            Cashu mint info
          </p>
        </div>
      </div>
    </div>
  );
};

export default MintHeader;