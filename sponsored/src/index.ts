import "dotenv/config";
import {
  createGelatoSmartWalletClient,
  sponsored,
} from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const sponsorApiKey = process.env.SPONSOR_API_KEY;

if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const account = privateKeyToAccount(privateKey);

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

createGelatoSmartWalletClient(client, { apiKey: sponsorApiKey })
  .execute({
    payment: sponsored(),
    calls: [
      {
        to: "0xa8851f5f279eD47a292f09CA2b6D40736a51788E",
        data: "0xd09de08a",
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
