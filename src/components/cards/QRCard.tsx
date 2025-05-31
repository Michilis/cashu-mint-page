import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';

interface QRCardProps {
  mintUrl: string;
}

const QRCard: React.FC<QRCardProps> = ({ mintUrl }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mintUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-brand-primary mb-4">Add This Mint to Your Wallet</h2>
        
        <div className="w-full max-w-md mb-4">
          <button
            onClick={handleCopy}
            className="w-full bg-brand-primary hover:bg-brand-light text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy Mint URL</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="text-brand-text hover:text-white transition-colors duration-200 flex items-center space-x-2"
        >
          <QrCode className="h-5 w-5" />
          <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
        </button>

        {showQR && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={mintUrl}
              size={200}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCard;