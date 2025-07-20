import React, { useState, useEffect } from 'react';
import { usePopularMints } from '../hooks/usePopularMints';
import { useGlobalReviews } from '../hooks/useGlobalReviews';
import { CASHU_RELAY_POOL } from '../utils/ndk';

const DebugInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Unknown');
  const { popularMints, loading: mintsLoading } = usePopularMints();
  const { recentReviews, loading: reviewsLoading } = useGlobalReviews();

  useEffect(() => {
    // Monitor console for connection messages
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('✅ NDK initialized successfully')) {
        setConnectionStatus('Connected');
      } else if (message.includes('❌ Failed to initialize')) {
        setConnectionStatus('Failed');
      } else if (message.includes('📊 Found') && message.includes('mints')) {
        setConnectionStatus('Data Found');
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleVisibility}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Debug Info
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Debug Information</h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="text-white">
          <div className="font-semibold">Connection Status:</div>
          <div className={`text-sm ${
            connectionStatus === 'Connected' ? 'text-green-400' :
            connectionStatus === 'Failed' ? 'text-red-400' :
            connectionStatus === 'Data Found' ? 'text-blue-400' :
            'text-gray-300'
          }`}>
            {connectionStatus}
          </div>
        </div>
        
        <div className="text-white">
          <div className="font-semibold">Popular Mints:</div>
          <div className="text-gray-300">
            Loading: {mintsLoading ? 'Yes' : 'No'}
          </div>
          <div className="text-gray-300">
            Count: {popularMints.length}
          </div>
          {popularMints.length > 0 && (
            <div className="text-gray-300">
              First: {popularMints[0]?.mintName} ({popularMints[0]?.reviewCount} reviews)
            </div>
          )}
        </div>
        
        <div className="text-white">
          <div className="font-semibold">Recent Reviews:</div>
          <div className="text-gray-300">
            Loading: {reviewsLoading ? 'Yes' : 'No'}
          </div>
          <div className="text-gray-300">
            Count: {recentReviews.length}
          </div>
          {recentReviews.length > 0 && (
            <div className="text-gray-300">
              First: {recentReviews[0]?.mintName} ({recentReviews[0]?.rating}/5)
            </div>
          )}
        </div>
        
        <div className="text-white">
          <div className="font-semibold">Environment:</div>
          <div className="text-gray-300">
            Base Path: {import.meta.env.VITE_BASE_PATH || '/'}
          </div>
          <div className="text-gray-300">
            Analytics: {import.meta.env.VITE_ENABLE_ANALYTICS || 'not set'}
          </div>
        </div>
        
        <div className="text-white">
          <div className="font-semibold">Shared NDK:</div>
          <div className="text-gray-300">
            Single connection
          </div>
          <div className="text-gray-300">
            {CASHU_RELAY_POOL.length} relays
          </div>
        </div>
        
        <div className="text-white">
          <div className="font-semibold">Timeouts:</div>
          <div className="text-gray-300">
            Mints: 20 seconds
          </div>
          <div className="text-gray-300">
            Reviews: 15 seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 