import "dotenv/config";
import {
  type GelatoTaskStatus,
  createGelatoSmartWalletClient,
  native,
} from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, encodeFunctionData, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { inkSepolia } from "viem/chains";

const privateKey = process.env.PRIVATE_KEY as Hex;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

// Counter contract address
const counterAddress = "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27";

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

createGelatoSmartWalletClient(client)
  .execute({
    payment: native(),
    calls: [
      {
        to: counterAddress, // Using the counter contract address
        data: incrementData,
        value: 0n,
      },
    ],
  })
  .then((response) => {
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
  });
