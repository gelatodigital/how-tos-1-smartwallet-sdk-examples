import "dotenv/config";
import {
  type GelatoTaskStatus,
  createGelatoSmartWalletClient,
  native,
} from "@gelatonetwork/smartwallet";
import {
  http,
  type Hex,
  createWalletClient,
  encodeFunctionData,
  parseEther,
  createPublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { inkSepolia } from "viem/chains";
import { gelato } from "@gelatonetwork/smartwallet/accounts";
import { getChainConfigByName, ChainConfig } from "../../constants/chainConfig";


const privateKey = process.env.PRIVATE_KEY as Hex;
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
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

  const client = createWalletClient({
    account,
    chain: chainConfig.chain,
    transport: http(),
  });

  const swc = await createGelatoSmartWalletClient(client);

  const response = await swc.execute({
    payment: native(),
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
