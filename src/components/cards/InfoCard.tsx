import React, { useState } from 'react';
import { MintInfo } from '../../types';
import { Globe, Key, Info, Copy, Check, ExternalLink } from 'lucide-react';

interface InfoCardProps {
  mintInfo: MintInfo;
  showMotd?: boolean;
  showTos?: boolean;
  showIcon?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ mintInfo, showMotd, showTos, showIcon }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const truncateUrl = (url: string) => {
    if (url.length > 50) {
      return `${url.substring(0, 30)}...${url.substring(url.length - 17)}`;
    }
    return url;
  };

  const canonicalize = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const uniqueUrls = (() => {
    const raw: string[] = [];
    if (mintInfo.url) raw.push(mintInfo.url);
    if (mintInfo.urls && mintInfo.urls.length > 0) raw.push(...mintInfo.urls);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const u of raw) {
      const key = canonicalize(u);
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push(u);
      }
    }
    return result;
  })();

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        {showIcon && mintInfo.icon && (
          <img 
            src={mintInfo.icon} 
            alt="Mint Icon" 
            className="w-12 h-12 mr-4 rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-brand-primary mb-1">
            {mintInfo.name || 'Unknown Mint'}
          </h1>
          {mintInfo.description && (
            <p className="text-brand-text italic">"{mintInfo.description}"</p>
          )}
        </div>
      </div>

      {mintInfo.description_long && (
        <div className="mb-4 text-brand-text">
          <p>{mintInfo.description_long}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Only show public key if present and non-empty */}
        {mintInfo.pubkey && mintInfo.pubkey.trim() !== '' && (
          <div className="flex items-start">
            <Key className="text-brand-primary mr-2 h-5 w-5 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-white font-semibold">Public Key</p>
              <div className="flex items-center group">
                <p className="text-brand-text break-all text-sm mr-2">{mintInfo.pubkey}</p>
                <button
                  onClick={() => handleCopy(mintInfo.pubkey, 'pubkey')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedStates['pubkey'] ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-brand-text hover:text-brand-primary" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {uniqueUrls.length > 0 && (
          <div className="flex items-start">
            <Globe className="text-brand-primary mr-2 h-5 w-5 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-white font-semibold">URLs</p>
              {uniqueUrls.map((url, index) => (
                <div key={`${canonicalize(url)}-${index}`} className="flex items-center group">
                  <p className="text-brand-text text-sm mr-2">{truncateUrl(url)}</p>
                  <button
                    onClick={() => handleCopy(url, `url-${index}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedStates[`url-${index}`] ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-brand-text hover:text-brand-primary" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showMotd && mintInfo.motd && (
        <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-brand-primary mb-4">
          <h3 className="text-white font-semibold mb-1">Message of the Day</h3>
          <p className="text-brand-text">{mintInfo.motd}</p>
        </div>
      )}

      {showTos && mintInfo.terms_of_service_url && (
        <div className="mt-4">
          <a 
            href={mintInfo.terms_of_service_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-light text-white rounded-lg transition-colors duration-200"
          >
            <span>Terms of Service</span>
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default InfoCard;