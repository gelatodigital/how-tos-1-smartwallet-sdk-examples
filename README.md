# Smart Wallet SDK Examples

## Prerequisites

- Node.js >= 23
- pnpm >= 10.8.1

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file and configure it with your credentials:

```bash
cp .env.example .env
```

Then edit the `.env` file with your private key and optional sponsor API key (required for sponsored transactions).

## Chain Configuration

All examples use Ink Sepolia as the target chain, configured using viem. The chain is imported directly from `viem/chains`:

```typescript
import { inkSepolia } from 'viem/chains'

// Use in client configuration
const client = createWalletClient({
  chain: inkSepolia,
  transport: http(),
})
```


## ERC20 Payment Tokens

### WETH (Wrapped Ether)
For transactions using WETH as the payment token, you'll need to convert your ETH to WETH first. The repository includes a helper script to do this:

```bash
tsx helper/getWeth.ts
```

By default, this script converts 0.1 ETH to WETH. To modify the amount:
1. Open `helper/getWeth.ts`
2. Adjust the `amount` parameter in the script
3. Run the script again

### USDC (USD Coin)
For transactions using USDC as the payment token:

1. Check the supported networks in `constants/chainConfigs.ts`
2. Get test USDC from the [Circle Faucet](https://faucet.circle.com/) for your chosen network
3. Ensure you have enough USDC in your wallet for the transaction

Note: The amount of USDC needed will depend on the gas costs and transaction requirements of your specific operation.

## Running Examples

### Native Payment Example

This example demonstrates how to send a native ETH transaction using a smart wallet:

```typescript
// Create a smart wallet client
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: inkSepolia,
  transport: http(),
})

// Send native ETH
const hash = await smartWalletClient.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
})
```

Run it with:
```bash
pnpm native
```

### ERC20 Payment Example

This example shows how to send ERC20 tokens (WETH) using a smart wallet:

```typescript
// Create a smart wallet client
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: inkSepolia,
  transport: http(),
})

// Send ERC20 tokens
const hash = await smartWalletClient.writeContract({
  address: WETH_ADDRESS,
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x...', parseEther('0.1')],
})
```

Run it with:
```bash
pnpm erc20
```

### Gas Estimates Example

This example demonstrates how to estimate gas costs for smart wallet operations:

```typescript
// Create a smart wallet client
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: inkSepolia,
  transport: http(),
})

// Estimate gas for a transaction
const gasEstimate = await smartWalletClient.estimateGas({
  to: '0x...',
  value: parseEther('0.1'),
})
```

Run it with:
```bash
pnpm estimate
```

### Sponsored Transaction Example

This example shows how to send transactions with gas sponsorship:

```typescript
// Create a sponsored smart wallet client
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: inkSepolia,
  transport: http(),
  sponsorApiKey: process.env.SPONSOR_API_KEY,
})

// Send sponsored transaction
const hash = await smartWalletClient.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
})
```

Run it with:
```bash
pnpm sponsored
```

### Kernel Sponsored Transaction Example

This example demonstrates how to use Kernel smart wallets with gas sponsorship:

```typescript
// Create a Kernel smart wallet client
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: inkSepolia,
  transport: http(),
  sponsorApiKey: process.env.SPONSOR_API_KEY,
  kernelVersion: '0.3.0',
})

// Send sponsored transaction
const hash = await smartWalletClient.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
})
```

Run it with:
```bash
pnpm kernel-sponsored
```

## Comparison with Kernel Implementation

### Using Gelato Smart Wallet SDK

```typescript
// Create wallet client
const walletClient = createWalletClient({
  account: signer,
  chain: inkSepolia,
  transport: http(""),
})

// Create Gelato smart wallet client
const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
  wallet: "kernel",
})

// Execute sponsored transaction
const results = await smartWalletClient.execute({
  payment: sponsored(process.env.NEXT_PUBLIC_SPONSOR_API_KEY || ""),
  calls: [
    // Your transaction calls here
  ],
})
```

### Using Kernel Directly

Here's how to set up a Kernel smart wallet client directly:

```typescript
// Create wallet client
const walletClient = createWalletClient({
  account,
  chain: inkSepolia,
  transport: http(""),
})

// Sign authorization for Kernel account
const authorization = await walletClient.signAuthorization({
  account,
  contractAddress: KernelVersionToAddressesMap[kernelVersion].accountImplementationAddress,
})

// Create ECDSA validator
const validator = await signerToEcdsaValidator(publicClient, {
  entryPoint,
  kernelVersion,
  signer: account,
})

// Create Kernel account
const kernelAccount = await createKernelAccount(publicClient as any, {
  address: account.address,
  eip7702Auth: authorization,
  entryPoint,
  kernelVersion,
  plugins: { sudo: validator },
})

// Create Kernel client
const kernelClient = createKernelAccountClient({
  account: kernelAccount,
  chain: inkSepolia,
  bundlerTransport: http(process.env.NEXT_PUBLIC_ULTRA_RELAY_URL || ""),
  paymaster: undefined,
  userOperation: {
    estimateFeesPerGas: async ({ bundlerClient }: { bundlerClient: any }) => {
      return getUserOperationGasPrice(bundlerClient)
    },
  },
})

// Send user operation
const userOpHash = await kernelClient.sendUserOperation({
  callData: "0x...",
  maxFeePerGas: BigInt(0),
  maxPriorityFeePerGas: BigInt(0),
})
```


