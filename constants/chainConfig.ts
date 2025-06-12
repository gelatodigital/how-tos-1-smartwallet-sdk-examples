import { Chain } from "viem";
import { inkSepolia, arbitrumSepolia, baseSepolia, sepolia, flowTestnet, storyAeneid } from "viem/chains";

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  tokenContract?: { usdc?: string; weth?: string, wip?: string };
  targetContract?: string;
  chain: Chain;
}

export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  inkSepolia: {
    name: "Ink Sepolia",
    chainId: 763373,
    rpcUrl: "https://rpc.ink-sepolia.gelato.digital",
    blockExplorer: "https://explorer-sepolia.inkonchain.com",
    tokenContract: {
      usdc: "",
      weth: "0x60C67E75292B101F9289f11f59aD7DD75194CCa6",
    },
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: inkSepolia,
  },
  arbSepolia: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io/",
    tokenContract: {
      usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // not available as payment token on arb sepolia
      weth: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    },
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: arbitrumSepolia,
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    tokenContract: {
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      weth: "0x4200000000000000000000000000000000000006",
    },
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: baseSepolia,
  },
  sepolia: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.drpc.org",
    blockExplorer: "https://sepolia.etherscan.io",
    tokenContract: {
      usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    },
    targetContract: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27", // Counter contract
    chain: sepolia,
  },
  flowTestnet: {
    name: "Flow Testnet",
    chainId: 545,
    rpcUrl: "https://testnet.evm.nodes.onflow.org",
    blockExplorer: "https://evm-testnet.flowscan.io",
    tokenContract: { usdc: "", weth: "" }, // erc20 gas payments not available on flow testnet
    targetContract: "0xE27C1359cf02B49acC6474311Bd79d1f10b1f8De", // Counter contract
    chain: flowTestnet,
  },
  storyAeneidTestnet: {
    name: "Story Aeneid Testnet",
    chainId: 1315,
    rpcUrl: "https://aeneid.storyrpc.io",
    blockExplorer: "https://aeneid.storyscan.io",
    tokenContract: {
      usdc: "",
      weth: "",
      wip: "0x1514000000000000000000000000000000000000", // WIP on Story Aeneid Testnet
    },
    targetContract: "0xa2202D3148ac0F0F44b0bED0153248a0524EdA8D", // Counter contract
    chain: storyAeneid,
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
