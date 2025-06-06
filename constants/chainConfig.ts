import { Chain } from "viem";
import { inkSepolia, arbitrumSepolia, baseSepolia } from "viem/chains";

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  tokenContract?: string;
  targetContract?: string;
  chain: Chain;
}
// WETH contract address on Ink Sepolia
const WETH_ADDRESS = "0x60C67E75292B101F9289f11f59aD7DD75194CCa6";

export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  inkSepolia: {
    name: "Ink Sepolia",
    chainId: 763373,
    rpcUrl: "https://rpc.ink-sepolia.gelato.digital",
    blockExplorer: "https://explorer-sepolia.inkonchain.com",
    tokenContract: "0x60C67E75292B101F9289f11f59aD7DD75194CCa6", // Example token contract
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: inkSepolia,
  },
  arbSepolia: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io/",
    tokenContract: "0x2836ae2eA2c013acD38028fD0C77B92cccFa2EE4", // Example token contract
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: arbitrumSepolia,
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    tokenContract: "0x4200000000000000000000000000000000000006", // WETH on Base Sepolia
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: baseSepolia,
  },
};

// Helper function to get chain config by chain ID
export const getChainConfigByChainId = (
  chainId: number
): ChainConfig | undefined => {
  return Object.values(CHAIN_CONFIGS).find(
    (config) => config.chainId === chainId
  );
};

// Helper function to get chain config by name
export const getChainConfigByName = (name: string): ChainConfig => {
  const config = CHAIN_CONFIGS[name];
  if (!config) {
    throw new Error(`Chain configuration not found for name: ${name}`);
  }
  return config;
};
