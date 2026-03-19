// Add this to frontend/lib/walletConnect.js
export const addPolkadotHubNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x191B6D1', // 420420417 in hex
        chainName: 'Polkadot Hub (Paseo)',
        nativeCurrency: {
          name: 'PAS',
          symbol: 'PAS',
          decimals: 18
        },
        rpcUrls: ['https://eth-asset-hub-paseo.dotters.network'],
        blockExplorerUrls: ['https://polkadot.testnet.routescan.io/']
      }]
    });
  } catch (error) {
    console.error('Failed to add network:', error);
  }
};

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await addPolkadotHubNetwork();
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }
  return false;
};
