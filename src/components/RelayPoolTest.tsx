import React, { useState } from 'react';
import { testRelayPool } from '../utils/ndk';

const RelayPoolTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    connectedRelays: number;
    totalEvents: number;
    cashuEvents: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await testRelayPool();
      setTestResults(results);
      console.log('✅ Relay pool test completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Relay pool test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Relay Pool Test</h3>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-lg transition-colors"
      >
        {loading ? 'Testing...' : 'Test Relay Pool'}
      </button>
      
      {testResults && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="text-green-400">
            ✅ Connected to {testResults.connectedRelays} relays
          </div>
          <div className="text-blue-400">
            📊 Found {testResults.totalEvents} total events
          </div>
          <div className="text-yellow-400">
            🏆 Found {testResults.cashuEvents} Cashu mint events
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-red-400 text-sm">
          ❌ Error: {error}
        </div>
      )}
    </div>
  );
};

export default RelayPoolTest; 