// Network verification utility for Polkadot Hub (Paseo)
export const POLKADOT_HUB_CONFIG = {
  chainId: 420420417,
  chainIdHex: '0x190F1B41', // Correct hex for 420420417
  name: 'Polkadot Hub (Paseo)',
  rpcUrl: 'https://eth-asset-hub-paseo.dotters.network',
  currency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18
  },
  explorer: 'https://polkadot.testnet.routescan.io'
};

export const checkNetworkConnection = async () => {
  if (!window.ethereum) {
    return { connected: false, error: 'No wallet detected' };
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    const isCorrectNetwork = parseInt(chainId, 16) === POLKADOT_HUB_CONFIG.chainId;
    const isConnected = accounts.length > 0;

    return {
      connected: isConnected,
      correctNetwork: isCorrectNetwork,
      currentChainId: parseInt(chainId, 16),
      expectedChainId: POLKADOT_HUB_CONFIG.chainId,
      account: accounts[0] || null,
      networkName: isCorrectNetwork ? POLKADOT_HUB_CONFIG.name : 'Unknown Network'
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export const switchToPolkadotHub = async () => {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  try {
    // First try to switch to existing network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLKADOT_HUB_CONFIG.chainIdHex }],
    });
    return true;
  } catch (error) {
    // If network doesn't exist (4902) or RPC conflict, try to add it
    if (error.code === 4902 || error.message.includes('RPC endpoint')) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLKADOT_HUB_CONFIG.chainIdHex,
            chainName: POLKADOT_HUB_CONFIG.name,
            nativeCurrency: POLKADOT_HUB_CONFIG.currency,
            rpcUrls: [POLKADOT_HUB_CONFIG.rpcUrl],
            blockExplorerUrls: [POLKADOT_HUB_CONFIG.explorer],
          }],
        });
        return true;
      } catch (addError) {
        // If still fails, user needs to manually remove conflicting network
        throw new Error('Please manually remove the conflicting Polkadot network from your wallet and try again');
      }
    }
    throw error;
  }
};
