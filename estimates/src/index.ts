import "dotenv/config";
import {
  createGelatoSmartWalletClient,
  sponsored,
} from "@gelatonetwork/smartwallet";
import {
  http,
  type Hex,
  createWalletClient,
  formatEther,
  encodeFunctionData,
  createPublicClient,
  Chain,
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

  const client = createWalletClient({
    account,
    chain: chainConfig.chain,
    transport: http(),
  });

  const swc = await createGelatoSmartWalletClient(client, {
    apiKey: sponsorApiKey,
  });

  const response = await swc.estimate({
    payment: sponsored(sponsorApiKey),
    calls: [
      {
        to: chainConfig.targetContract as `0x${string}`,
        data: incrementData,
        value: 0n,
      },
    ],
  });

  console.log(
    `Estimated fee: ${formatEther(BigInt(response.fee.estimatedFee))} ETH`
  );
  console.log(`Estimated gas: ${response.gas} GAS`);
  process.exit(0);
})();
