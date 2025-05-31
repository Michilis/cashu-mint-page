import React from 'react';
import { MintInfo } from '../types';
import { formatNutNumber } from '../utils/formatters';
import { Check, Zap, CreditCard, Shield, ArrowLeftRight } from 'lucide-react';

interface NutSupportTableProps {
  mintInfo: MintInfo;
}

// Map common NUT numbers to icons and descriptions
const nutMetadata: Record<string, { icon: any; name: string; description: string }> = {
  '0': { icon: CreditCard, name: 'Mint', description: 'Basic minting and melting' },
  '1': { icon: ArrowLeftRight, name: 'Swap', description: 'Token swapping' },
  '2': { icon: Check, name: 'Check', description: 'Spendability check' },
  '3': { icon: ArrowLeftRight, name: 'Split', description: 'Token splitting' },
  '4': { icon: Shield, name: 'MPP', description: 'Mint payment proofs' },
  '5': { icon: Zap, name: 'Lightning', description: 'Lightning integration' },
  '6': { icon: Check, name: 'States', description: 'Token state checking' },
  '7': { icon: Shield, name: 'Fees', description: 'Fee structure' },
  '8': { icon: ArrowLeftRight, name: 'Lightning', description: 'Lightning melting' },
  '9': { icon: Shield, name: 'Restore', description: 'Backup restoration' },
  '10': { icon: Check, name: 'Spending', description: 'Spending conditions' },
  '11': { icon: Shield, name: 'P2PK', description: 'Pay-to-public-key' },
  '12': { icon: Shield, name: 'DLEQ', description: 'Discrete log proofs' },
};

const NutSupportTable: React.FC<NutSupportTableProps> = ({ mintInfo }) => {
  // Filter only supported and non-disabled nuts
  const supportedNuts = Object.entries(mintInfo.nuts || {}).filter(
    ([_, nutInfo]) => nutInfo.supported && !nutInfo.disabled
  );

  if (supportedNuts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-400/10 rounded-lg mr-4">
          <Check className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Supported Nuts</h2>
          <p className="text-sm text-gray-400">Cashu protocol features supported by this mint</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {supportedNuts.map(([nutKey, nutInfo]) => {
          const nutNumber = formatNutNumber(nutKey);
          const metadata = nutMetadata[nutNumber] || { 
            icon: Check, 
            name: `NUT-${nutNumber}`, 
            description: 'Protocol feature' 
          };
          const IconComponent = metadata.icon;
          
          return (
            <div 
              key={nutKey}
              className="group relative bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* NUT Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <IconComponent className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    NUT-{nutNumber}
                  </span>
                </div>
                <div className="flex items-center justify-center w-6 h-6 bg-green-400/20 rounded-full">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
              </div>
              
              {/* NUT Name & Description */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-200 mb-1">{metadata.name}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{metadata.description}</p>
              </div>
              
              {/* Technical Details */}
              <div className="space-y-2">
                {nutInfo.methods && nutInfo.methods.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {nutInfo.methods.map((method, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {nutInfo.unit && (
                    <span className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded border border-gray-500/30">
                      {nutInfo.unit}
                    </span>
                  )}
                  
                  {(nutInfo.min_amount !== undefined || nutInfo.max_amount !== undefined) && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30">
                      {nutInfo.min_amount !== undefined ? `${nutInfo.min_amount}` : '0'}
                      {nutInfo.min_amount !== undefined && nutInfo.max_amount !== undefined ? '-' : ''}
                      {nutInfo.max_amount !== undefined ? nutInfo.max_amount : '∞'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          {supportedNuts.length} Cashu protocol features supported • Learn more about{' '}
          <a 
            href="https://github.com/cashubtc/nuts" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Cashu Nuts
          </a>
        </p>
      </div>
    </div>
  );
};

export default NutSupportTable;