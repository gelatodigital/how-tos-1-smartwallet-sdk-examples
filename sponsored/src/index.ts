import "dotenv/config";
import {
  createGelatoSmartWalletClient,
  type GelatoTaskStatus,
  sponsored,
} from "@gelatonetwork/smartwallet";
import {
  http,
  type Hex,
  createWalletClient,
  encodeFunctionData,
  createPublicClient,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { gelato } from "@gelatonetwork/smartwallet/accounts";
import { getChainConfigByName, ChainConfig } from "../../constants/chainConfig";

// Sponsor API Key for configured chain
const sponsorApiKey = process.env.SPONSOR_API_KEY;
if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

//Note: Ink Sepolia Chain Config, Use the chain name to get the chain config
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

console.log("Encoded increment() function data:", incrementData);

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: chainConfig.chain,
  transport: http(),
});

(async () => {
  const account = await gelato({
    owner,
    client: publicClient,
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

  console.log("Preparing transaction...");
  const preparedCalls = await swc.prepare({
    payment: sponsored(sponsorApiKey),
    calls: [
      {
        to: chainConfig.targetContract,
        data: incrementData,
        value: 0n,
      },
    ],
  });

  const response = await swc.send({
    preparedCalls,
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
