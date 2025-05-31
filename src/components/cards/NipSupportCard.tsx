import React from 'react';
import { MintInfo } from '../../types';
import { ExternalLink, Check } from 'lucide-react';

interface NipSupportCardProps {
  mintInfo: MintInfo;
}

const NipSupportCard: React.FC<NipSupportCardProps> = ({ mintInfo }) => {
  const supportedNips = Object.entries(mintInfo.nips || {}).filter(
    ([_, nipInfo]) => nipInfo.supported && !nipInfo.disabled
  );

  if (supportedNips.length === 0) {
    return null;
  }

  const getNipDocUrl = (nipNumber: string) => {
    return `https://github.com/nostr-protocol/nips/blob/master/${nipNumber}.md`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl mb-6">
      <div className="flex items-center mb-3">
        <Check className="h-4 w-4 text-green-400 mr-2" />
        <h2 className="text-lg font-bold text-brand-primary">Supported NIPs</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {supportedNips.map(([nipNumber, nipInfo]) => (
          <a 
            key={nipNumber}
            href={getNipDocUrl(nipNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-700/50 rounded-lg p-2 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex flex-col relative">
              <div className="bg-gray-600 text-brand-primary px-1.5 py-0.5 rounded text-xs font-medium text-center mb-1 group-hover:bg-gray-500 transition-colors">
                NIP-{nipNumber}
                <ExternalLink className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {nipInfo.description && (
                <p 
                  className="text-[10px] sm:text-xs text-brand-text truncate text-center"
                  title={nipInfo.description}
                >
                  {nipInfo.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default NipSupportCard