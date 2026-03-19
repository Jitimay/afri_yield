'use client';

import { useState, useEffect } from 'react';
import { checkNetworkConnection, switchToPolkadotHub, POLKADOT_HUB_CONFIG } from '@/lib/networkChecker';

interface NetworkStatus {
  connected: boolean;
  correctNetwork?: boolean;
  currentChainId?: number;
  expectedChainId?: number;
  account?: string | null;
  networkName?: string;
  error?: string;
}

export default function NetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    const result = await checkNetworkConnection();
    setStatus(result);
  };

  const handleSwitchNetwork = async () => {
    setLoading(true);
    try {
      await switchToPolkadotHub();
      await checkStatus();
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkStatus);
      window.ethereum.on('accountsChanged', checkStatus);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', checkStatus);
          window.ethereum.removeListener('accountsChanged', checkStatus);
        }
      };
    }
  }, []);

  if (!status) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="text-sm text-gray-600">Checking network...</div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-sm text-red-600">❌ {status.error}</div>
      </div>
    );
  }

  const isCorrect = status.connected && status.correctNetwork;

  return (
    <div className={`border rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network Status</span>
          {isCorrect ? (
            <span className="text-green-600 text-sm">✅ Connected to Paseo</span>
          ) : (
            <span className="text-yellow-600 text-sm">⚠️ Wrong Network</span>
          )}
        </div>
        
        <div className="text-xs space-y-1">
          <div>
            <span className="text-gray-500">Current Network:</span> {status.networkName}
          </div>
          <div>
            <span className="text-gray-500">Chain ID:</span> {status.currentChainId} 
            {status.correctNetwork ? ' ✅' : ` (Expected: ${POLKADOT_HUB_CONFIG.chainId}) ❌`}
          </div>
          {status.account && (
            <div>
              <span className="text-gray-500">Account:</span> {status.account.slice(0, 6)}...{status.account.slice(-4)}
            </div>
          )}
        </div>

        {!status.correctNetwork && status.connected && (
          <button
            onClick={handleSwitchNetwork}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Switching...' : 'Switch to Polkadot Hub (Paseo)'}
          </button>
        )}
      </div>
    </div>
  );
}
