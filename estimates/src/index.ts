import "dotenv/config";
import { createGelatoSmartWalletClient, sponsored } from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, formatEther, encodeFunctionData, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getChainConfigByChainId } from "../../constants/chainConfig";

const sponsorApiKey = process.env.SPONSOR_API_KEY;

if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

const chainId = 421614; // Arbitrum Sepolia
const chainConfig = getChainConfigByChainId(chainId);

if (!chainConfig) {
  throw new Error("Chain configuration not found");
}

// Counter contract address
const counterAddress = chainConfig.targetContract;

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const account = privateKeyToAccount(privateKey);

const client = createWalletClient({
  account,
  chain: chainConfig.chain,
  transport: http()
});

// Example of creating a payload for increment() function
const incrementAbi = [{
  name: "increment",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [],
  outputs: []
}] as const;

// Create the encoded function data
const incrementData = encodeFunctionData({
  abi: incrementAbi,
  functionName: "increment"
});

console.log("Encoded increment() function data:", incrementData);

createGelatoSmartWalletClient(client, { apiKey: sponsorApiKey })
  .estimate({
    payment: sponsored(sponsorApiKey),
    calls: [
      {
        to: counterAddress as `0x${string}`, // Using the counter contract address
        data: incrementData,
        value: 0n
      }
    ]
  })
  .then(async ({ estimatedFee, estimatedGas }) => {
    console.log(`Estimated fee: ${formatEther(estimatedFee)} ETH`);
    console.log(`Estimated gas: ${estimatedGas} GAS`);
    process.exit(0);
  });
