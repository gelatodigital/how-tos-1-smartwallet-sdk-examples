import "dotenv/config";
import {
  createGelatoSmartWalletClient,
  sponsored,
  type GelatoTaskStatus,
} from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, encodeFunctionData, createPublicClient, Chain } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { kernel } from "@gelatonetwork/smartwallet/accounts";
import { getChainConfigByName, ChainConfig } from "../../constants/chainConfig";

// Sponsor API Key for configured chain
const sponsorApiKey = process.env.SPONSOR_API_KEY;

if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}
//Note: Ink Sepolia Chain Config, Use the chain name to get the chain config
const chainConfig = getChainConfigByName("baseSepolia") as ChainConfig;

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

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: chainConfig.chain,
  transport: http(),
});

(async () => {
  const account = await kernel({
    owner,
    client: publicClient,
    eip7702: false, // set to true if you want to use EIP-7702 with ERC-4337
  });

  console.log("Account address:", account.address);

  const client = createWalletClient({
    account,
    chain: chainConfig.chain,
    transport: http(),
  });

  const swc = await createGelatoSmartWalletClient(client, {
    apiKey: sponsorApiKey,
  });

  const response = await swc.execute({
    payment: sponsored(sponsorApiKey),
    calls: [
      {
        to: chainConfig.targetContract as `0x${string}`,
        data: incrementData,
        value: 0n,
      },
    ],
  });

  console.log(`Your Gelato id is: ${response.id}`);
  console.log(
    `Check the status of your request here: https://api.gelato.digital/tasks/status/${response.id}`
  );
  console.log("Waiting for transaction to be confirmed...");

  // Listen for events
  response.on("success", (status: GelatoTaskStatus) => {
    console.log(`Transaction successful: ${chainConfig.blockExplorer}/tx/${status.transactionHash}`);
    process.exit(0);
  });
  response.on("error", (error: Error) => {
    console.error(`Transaction failed: ${error.message}`);
    process.exit(1);
  });
})();
