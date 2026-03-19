// Quick network fix - you're on wrong chain ID
console.log('Current Chain ID: 420441620');
console.log('Expected Chain ID: 420420417 (Polkadot Hub Paseo)');

// You need to switch networks in your wallet
// Chain ID 420441620 is NOT Polkadot Hub (Paseo)

const CORRECT_NETWORK = {
  chainId: '0x191B6D1', // 420420417 in hex
  chainName: 'Polkadot Hub (Paseo)',
  nativeCurrency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18
  },
  rpcUrls: ['https://eth-asset-hub-paseo.dotters.network'],
  blockExplorerUrls: ['https://polkadot.testnet.routescan.io']
};

// Add this network to your wallet
window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [CORRECT_NETWORK]
});
