'use client';

import { useWallet } from '@/lib/walletContext';
import { useState } from 'react';

export default function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.address) {
    return (
      <div className="flex items-center gap-4">
        {/* Balance Display */}
        <div className="hidden md:block bg-gray-50 rounded-xl px-4 py-2">
          <div className="text-xs text-gray-500 mb-1">Balances</div>
          <div className="font-mono text-sm">
            <span className="text-blue-600 font-semibold">{wallet.balance.native} PAS</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-emerald-600 font-semibold">{wallet.balance.ausd} AUSD</span>
          </div>
        </div>

        {/* Address & Disconnect */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm">{truncateAddress(wallet.address)}</span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🔗</span>
            <span>Connect Wallet</span>
          </div>
        )}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
