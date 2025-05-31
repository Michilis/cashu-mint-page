import React from 'react';
import { MintInfo } from '../types';
import { formatNutNumber } from '../utils/formatters';
import { Check } from 'lucide-react';

interface NutSupportTableProps {
  mintInfo: MintInfo;
}

const NutSupportTable: React.FC<NutSupportTableProps> = ({ mintInfo }) => {
  // Filter only supported and non-disabled nuts
  const supportedNuts = Object.entries(mintInfo.nuts || {}).filter(
    ([_, nutInfo]) => nutInfo.supported && !nutInfo.disabled
  );

  if (supportedNuts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-6">
        <Check className="h-6 w-6 text-green-400 mr-3" />
        <h2 className="text-2xl font-bold text-brand-primary">Supported Nuts</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportedNuts.map(([nutKey, nutInfo]) => (
          <div 
            key={nutKey}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-white">
                NUT-{formatNutNumber(nutKey)}
              </span>
              <span className="text-green-400">
                <Check className="h-4 w-4" />
              </span>
            </div>
            
            {nutInfo.methods && nutInfo.methods.length > 0 && (
              <div className="text-sm text-brand-text">
                <span className="text-brand-textDark">Methods: </span>
                {nutInfo.methods.join(', ')}
              </div>
            )}
            
            {nutInfo.unit && (
              <div className="text-sm text-brand-text">
                <span className="text-brand-textDark">Unit: </span>
                {nutInfo.unit}
              </div>
            )}
            
            {(nutInfo.min_amount !== undefined || nutInfo.max_amount !== undefined) && (
              <div className="text-sm text-brand-text">
                <span className="text-brand-textDark">Limits: </span>
                {nutInfo.min_amount !== undefined ? `${nutInfo.min_amount} ` : ''}
                {nutInfo.min_amount !== undefined && nutInfo.max_amount !== undefined ? '- ' : ''}
                {nutInfo.max_amount !== undefined ? nutInfo.max_amount : ''}
                {nutInfo.unit && ` ${nutInfo.unit}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutSupportTable;