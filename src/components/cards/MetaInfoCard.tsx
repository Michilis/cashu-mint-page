import React from 'react';
import { MintInfo } from '../../types';
import { Info, Clock, Zap, Shield, ArrowDownToLine, Lock } from 'lucide-react';
import { formatUnixTime } from '../../utils/formatters';

interface MetaInfoCardProps {
  mintInfo: MintInfo;
}

const MetaInfoCard: React.FC<MetaInfoCardProps> = ({ mintInfo }) => {
  const getDefaultUnit = () => {
    const nut4 = mintInfo.nuts?.['4'];
    return nut4?.methods?.[0]?.unit || 'sats';
  };

  const getAmountLimits = () => {
    const nut4 = mintInfo.nuts?.['4'];
    if (!nut4?.methods?.[0]) return null;

    const method = nut4.methods[0];
    const min = method.min_amount;
    const max = method.max_amount;
    const unit = method.unit || getDefaultUnit();

    if (min === undefined && max === undefined) return null;

    return {
      min: min !== undefined ? `${min} ${unit}` : `0 ${unit}`,
      max: max !== undefined ? `${max} ${unit}` : '∞',
    };
  };

  const getWithdrawalLimits = () => {
    const nut5 = mintInfo.nuts?.['5'];
    if (!nut5) return null;

    const min = nut5.min_amount;
    const max = nut5.max_amount;
    const unit = nut5.unit || getDefaultUnit();

    if (min === undefined && max === undefined) return null;

    return {
      min: min !== undefined ? `${min} ${unit}` : `0 ${unit}`,
      max: max !== undefined ? `${max} ${unit}` : '∞',
    };
  };

  const limits = getAmountLimits();
  const withdrawalLimits = getWithdrawalLimits();
  const isPegOutOnly = mintInfo.nuts?.['5']?.peg_out_only === true;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-6">
        <Info className="h-6 w-6 text-brand-primary mr-3" />
        <h2 className="text-2xl font-bold text-brand-primary">Mint Details</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Version Info */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-gray-600 rounded-full p-2">
              <Shield className="text-brand-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Version</p>
              <p className="text-brand-text text-sm">
                {mintInfo.version || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Server Time */}
        {mintInfo.time && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-600 rounded-full p-2">
                <Clock className="text-brand-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Server Time</p>
                <p className="text-brand-text text-sm">
                  {formatUnixTime(mintInfo.time)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Amount Limits */}
        {limits && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-600 rounded-full p-2">
                <Zap className="text-brand-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Amount Limits</p>
                <p className="text-brand-text text-sm">
                  Min: {limits.min}<br />
                  Max: {limits.max}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Limits */}
        {withdrawalLimits && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-600 rounded-full p-2">
                <ArrowDownToLine className="text-brand-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Withdrawal Limits</p>
                <p className="text-brand-text text-sm">
                  Min: {withdrawalLimits.min}<br />
                  Max: {withdrawalLimits.max}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PEG_OUT_ONLY Status */}
        {isPegOutOnly && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-600 rounded-full p-2">
                <Lock className="text-brand-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Peg-out Only</p>
                <p className="text-brand-text text-sm">
                  This mint only allows withdrawals
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaInfoCard;