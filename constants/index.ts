import { defineChain } from "viem";

export const inkSepoliaChain = defineChain({
    id: 763373,
    name: 'Ink Sepolia',
    network: 'ink-sepolia',
    nativeCurrency: {
      name: 'Eth',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-gel-sepolia.inkonchain.com'],
      },
      public: {
        http: ['https://rpc-gel-sepolia.inkonchain.com'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BlockScout',
        url: 'https://explorer-sepolia.inkonchain.com/',
      },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 0,
      },
    },
  })
  