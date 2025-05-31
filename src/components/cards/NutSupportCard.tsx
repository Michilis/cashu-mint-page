import React from 'react';
import { MintInfo } from '../../types';
import { formatNutNumber } from '../../utils/formatters';
import { Check, ExternalLink } from 'lucide-react';

interface NutSupportCardProps {
  mintInfo: MintInfo;
}

const NutSupportCard: React.FC<NutSupportCardProps> = ({ mintInfo }) => {
  const supportedNuts = Object.entries(mintInfo.nuts || {}).filter(
    ([_, nutInfo]) => nutInfo.supported && !nutInfo.disabled
  );

  if (supportedNuts.length === 0) {
    return null;
  }

  const getNutDocUrl = (nutNumber: string) => {
    const paddedNumber = formatNutNumber(nutNumber).padStart(2, '0');
    return `https://github.com/cashubtc/nuts/blob/main/${paddedNumber}.md`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-3">
        <Check className="h-4 w-4 text-green-400 mr-2" />
        <h2 className="text-lg font-bold text-brand-primary">Supported Nuts</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {supportedNuts.map(([nutKey, nutInfo]) => (
          <a 
            key={nutKey}
            href={getNutDocUrl(nutKey)}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-700/50 rounded-lg p-2 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex flex-col relative">
              <div className="bg-gray-600 text-brand-primary px-1.5 py-0.5 rounded text-xs font-medium text-center mb-1 group-hover:bg-gray-500 transition-colors">
                NUT-{formatNutNumber(nutKey)}
                <ExternalLink className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="min-w-0">
                {nutInfo.methods && nutInfo.methods.length > 0 && (
                  <p 
                    className="text-[10px] sm:text-xs text-brand-text truncate text-center"
                    title={nutInfo.methods.join(', ')}
                  >
                    {nutInfo.methods.join(', ')}
                  </p>
                )}
                {(nutInfo.min_amount !== undefined || nutInfo.max_amount !== undefined) && (
                  <p className="text-[9px] sm:text-xs text-brand-textDark mt-0.5 text-center">
                    {nutInfo.min_amount !== undefined ? `${nutInfo.min_amount}` : '0'}
                    {nutInfo.min_amount !== undefined && nutInfo.max_amount !== undefined ? '-' : ''}
                    {nutInfo.max_amount !== undefined ? nutInfo.max_amount : '∞'}
                    {nutInfo.unit && (
                      <span className="ml-0.5">{nutInfo.unit}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NutSupportCard;