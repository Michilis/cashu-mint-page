import React, { useState } from 'react';
import { MintInfo } from '../../types';
import { formatNutNumber } from '../../utils/formatters';
import { getNutInfo } from '../../utils/nutInfo';
import { Check, ExternalLink, Info } from 'lucide-react';

interface NutSupportCardProps {
  mintInfo: MintInfo;
}

const NutSupportCard: React.FC<NutSupportCardProps> = ({ mintInfo }) => {
  const [hoveredNut, setHoveredNut] = useState<string | null>(null);
  
  const supportedNuts = Object.entries(mintInfo.nuts || {}).filter(
    ([_, nutInfo]) => {
      // Include nuts that are explicitly supported
      if (nutInfo.supported === true) return true;
      
      // Include nuts that have methods (indicating they are supported)
      if (nutInfo.methods && nutInfo.methods.length > 0) return true;
      
      // Include nuts that have supported array (like NUT-17)
      if (nutInfo.supported && Array.isArray(nutInfo.supported) && nutInfo.supported.length > 0) return true;
      
      // Exclude disabled nuts
      return !nutInfo.disabled;
    }
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
        {supportedNuts.map(([nutKey, nutInfo]) => {
          const nutDetails = getNutInfo(nutKey);
          
          return (
            <div key={nutKey} className="relative group">
              <a 
            href={getNutDocUrl(nutKey)}
            target="_blank"
            rel="noopener noreferrer"
                className="block bg-gray-700/50 rounded-lg p-2 hover:bg-gray-700 transition-all duration-200"
                onMouseEnter={() => setHoveredNut(nutKey)}
                onMouseLeave={() => setHoveredNut(null)}
          >
            <div className="flex flex-col relative">
                  <div className="bg-gray-600 text-brand-primary px-1.5 py-0.5 rounded text-xs font-medium text-center mb-1 group-hover:bg-gray-500 transition-colors flex items-center justify-center gap-1">
                NUT-{formatNutNumber(nutKey)}
                    <Info className="w-3 h-3 opacity-60" />
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="min-w-0">
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
              
              {/* Hover Tooltip */}
              {hoveredNut === nutKey && nutDetails && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-brand-primary text-base">{nutDetails.title}</h3>
                    <div className="text-xs text-brand-textDark">NUT-{formatNutNumber(nutKey)}</div>
                  </div>
                  
                  <p className="text-brand-text mb-3 text-xs leading-relaxed">
                    {nutDetails.description}
                  </p>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-white text-xs mb-1">Features:</h4>
                    <ul className="text-xs text-brand-text space-y-1">
                      {nutDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-brand-primary mr-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-white text-xs mb-1">Use Case:</h4>
                    <p className="text-xs text-brand-text leading-relaxed">
                      {nutDetails.useCase}
                    </p>
                  </div>
                  
                  {nutDetails.technicalDetails && (
                    <div>
                      <h4 className="font-semibold text-white text-xs mb-1">Technical Details:</h4>
                      <p className="text-xs text-brand-textDark leading-relaxed">
                        {nutDetails.technicalDetails}
                      </p>
                    </div>
                  )}
                  
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NutSupportCard;