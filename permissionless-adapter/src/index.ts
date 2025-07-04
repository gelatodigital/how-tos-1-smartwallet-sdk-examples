import "dotenv/config";
import { WalletEncoding, sponsored } from "@gelatonetwork/smartwallet";
import { http, type Hex, encodeFunctionData, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getChainConfigByName, ChainConfig } from "../../constants/chainConfig";
import {
  gelatoBundlerActions,
  getUserOperationGasPrice,
} from "@gelatonetwork/smartwallet/adapter";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";

// Sponsor API Key for configured chain
const sponsorApiKey = process.env.SPONSOR_API_KEY;
if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

//Note: Ink Sepolia Chain Config, Use the chain name to get the chain config
const chainConfig = getChainConfigByName("sepolia") as ChainConfig;

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
  const account = await toSafeSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.4.1",
  });

  const bundler = createSmartAccountClient({
    account,
    chain: chainConfig.chain,
    // Important: Chain transport (chain rpc) must be passed here instead of bundler transport
    bundlerTransport: http(),
    userOperation: {
      estimateFeesPerGas: async () => {
        return getUserOperationGasPrice(chainConfig.chain.id, sponsorApiKey).then(
          ({ fast }) => fast
        );
      },
    },
  }).extend(
    gelatoBundlerActions({
      payment: sponsored(sponsorApiKey),
      // payment: erc20(paymentToken),
      // payment: native(),
      encoding: WalletEncoding.Safe,
    })
  );

  const gasPrice = await bundler
    .getUserOperationGasPrice()
    .then(({ fast }) => fast);
  console.log("User operation gas price: ", gasPrice);

  const taskId = await bundler.sendUserOperation({
    calls: [
      {
        to: chainConfig.targetContract as `0x${string}`,
        data: incrementData,
        value: 0n,
      },
    ],
  });

  console.log(`Your Gelato id is: ${taskId}`);
  console.log("Waiting for transaction to be confirmed...");

  const receipt = await bundler.waitForUserOperationReceipt({ hash: taskId });
  console.log(`Transaction successful: ${receipt.receipt.transactionHash}`);
})();
