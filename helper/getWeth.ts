import "dotenv/config";
import { http, createWalletClient, parseEther, parseAbi, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getChainConfigByChainId } from "../constants/chainConfig";

const chainId = 421614;
const chainConfig = getChainConfigByChainId(chainId);

// WETH contract address on Arbitrum Sepolia
const WETH_ADDRESS = chainConfig?.tokenContract;
// WETH ABI for deposit function
const wethAbi = parseAbi([
    'function deposit() payable',
    'function withdraw(uint256)',
    'function balanceOf(address) view returns (uint256)',
  ])

async function getWeth(privateKey: string, amount: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    chain: chainConfig?.chain,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: chainConfig?.chain,
    transport: http(),
  });

  try {
    const hash = await walletClient.writeContract({
      address: WETH_ADDRESS as `0x${string}`,
      abi: wethAbi,
      functionName: "deposit",
      value: parseEther(amount),
      chain: chainConfig?.chain,
    });

    console.log(`Transaction hash: ${hash}`);
    console.log(`View transaction: https://explorer-sepolia.inkonchain.com/tx/${hash}`);
    
    // Wait for transaction to be finalized
    console.log("Waiting for transaction to be finalized...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction finalized!");

    // Check WETH balance
    const balance = await publicClient.readContract({
      address: WETH_ADDRESS as `0x${string}`,
      abi: wethAbi,
      functionName: "balanceOf",
      args: [account.address],
    });

    console.log(`WETH Balance: ${balance} wei (${Number(balance) / 1e18} WETH)`);
    
    return hash;
  } catch (error) {
    console.error("Error getting WETH:", error);
    throw error;
  }
}

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set in .env file");
}

// Amount of ETH to convert to WETH
const amount = "0.1";

async function main() {
  try {
    console.log(`Converting ${amount} ETH to WETH...`);
    const txHash = await getWeth(privateKey as string, amount);
    console.log("Success! Transaction hash:", txHash);
  } catch (error) {
    console.error("Failed to get WETH:", error);
    process.exit(1);
  }
}

main(); 