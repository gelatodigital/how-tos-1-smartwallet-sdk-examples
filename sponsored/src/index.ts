import "dotenv/config";
import {
  createGelatoSmartWalletClient,
  sponsored,
} from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, encodeFunctionData, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { inkSepolia } from "viem/chains";

const sponsorApiKey = process.env.SPONSOR_API_KEY;

if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

// Counter contract address
const counterAddress = "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27";

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const account = privateKeyToAccount(privateKey);

const client = createWalletClient({
  account,
  chain: inkSepolia,
  transport: http(),
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
  .execute({
    payment: sponsored(),
    calls: [
      {
        to: counterAddress, // Using the counter contract address
        data: incrementData,
        value: 0n,
      },
    ],
  })
  .then(async (response) => {
    console.log(`Your Gelato id is: ${response.id}`);
    console.log(
      `Check the status of your request here: https://api.gelato.digital/tasks/status/${response.id}`
    );
    console.log("Waiting for transaction to be confirmed...");
    const txHash = await response.wait();
    console.log(`Transaction hash: ${txHash}`);

    process.exit(0);
  });
