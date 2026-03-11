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
        <div className="text-sm">
          <div className="text-gray-600 dark:text-gray-400">Balances:</div>
          <div className="font-mono">
            {wallet.balance.native} DEV | {wallet.balance.ausd} AUSD
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <span className="font-mono text-sm">{truncateAddress(wallet.address)}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
