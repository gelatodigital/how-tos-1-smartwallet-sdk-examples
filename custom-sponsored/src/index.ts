import "dotenv/config";
import {
  type GelatoTaskStatus,
  createGelatoSmartWalletClient,
  sponsored,
} from "@gelatonetwork/smartwallet";
import { custom } from "@gelatonetwork/smartwallet/accounts";
import { http, type Hex, createPublicClient, createWalletClient, encodeFunctionData } from "viem";
import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getChainConfigByName, ChainConfig } from "../../constants/chainConfig";

const sponsorApiKey = process.env.SPONSOR_API_KEY;

if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

// Get chain config
const chainConfig = getChainConfigByName("inkSepolia") as ChainConfig;

// Example of creating a payload for increment() function
const incrementAbi = [
  {
    name: "increment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

// Create the encoded function data
const incrementData = encodeFunctionData({
  abi: incrementAbi,
  functionName: "increment",
});

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: chainConfig.chain,
  transport: http(),
});

(async () => {
  // Defining an EIP7702 account using as delegation address "0x11923b4c785d87bb34da4d4e34e9feea09179289"
  // Using ERC4337 and entry point v0.8
  const account = await custom<typeof entryPoint08Abi, "0.8">({
    owner,
    client: publicClient,
    authorization: {
      account: owner,
      address: "0x11923b4c785d87bb34da4d4e34e9feea09179289",
    },
    entryPoint: {
      abi: entryPoint08Abi,
      address: entryPoint08Address,
      version: "0.8",
    },
    scw: {
      encoding: "erc7821",
    },
    eip7702: true,
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
        to: chainConfig.targetContract!,
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
    console.log(`Transaction successful: ${status.transactionHash}`);
    process.exit(0);
  });
  response.on("error", (error: Error) => {
    console.error(`Transaction failed: ${error.message}`);
    process.exit(1);
  });
})();
