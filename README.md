# Smart Wallet SDK Examples

## Prerequisites

- Node.js >= 23
- pnpm >= 10.8.1

## Quick Start

> **Note:** The project is pre-configured for **Ink Sepolia** testnet, but you can easily switch to other supported networks.  
> Check available networks in `constants/chainConfig.ts` and update the example files by changing the Network name.

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/gelatodigital/how-tos-1-smartwallet-sdk-examples.git
cd how-tos-1-smartwallet-sdk-examples

# Install dependencies
pnpm install
```

### Step 2: Environment Configuration

Create your environment file:

```bash
# Create .env file manually
touch .env
```

Add the following variables to your `.env` file:

```env
# Your private key (optional - random key will be generated if not provided)
PRIVATE_KEY=your_private_key_here

# Sponsor API key for gasless transactions (get from https://relay.gelato.network)
SPONSOR_API_KEY=your_sponsor_api_key_here
```

**Quick Setup:** You can start with just the `SPONSOR_API_KEY` for sponsored transactions, or leave `PRIVATE_KEY` empty to use a generated key.

### Step 3: Get Your Sponsor API Key

For **sponsored transactions** (gasless), you'll need a Sponsor API Key:

1. Visit the [Gelato Relay App](https://relay.gelato.network)
2. Create an account and generate a Sponsor API Key for **Ink Sepolia**
3. Add the key to your `.env` file

**Need help?** Check out our [How to Create a Sponsor API Key Guide](https://docs.gelato.cloud/smart-wallets/how-to-guides/create-a-sponsor-api-key)

### Step 4: Get Test Tokens

For testing on **Ink Sepolia**:

- **WETH**: Convert ETH to WETH using our helper script (see ERC20 section below)

---

## Quick Demo

Want to see it in action? Try this simple sponsored transaction:

```bash
# Run a sponsored transaction (requires SPONSOR_API_KEY)
pnpm sponsored
```

This will:
1. Create a smart wallet
2. Send a sponsored transaction
3. Show you the transaction hash

---

## Run All Examples

### Sponsored Transactions (Gasless)
```bash
pnpm sponsored
```
Send transactions without paying gas fees using your Sponsor API Key.

### ERC20 Gas Payments
```bash
# First, get WETH for gas payments
pnpm getWeth

# Then run ERC20 example
pnpm erc20
```
Pay for transactions using WETH instead of native ETH.

### Native Gas Payments
```bash
pnpm native
```
Traditional transactions using native ETH for gas fees.

### Gas Estimation
```bash
pnpm estimate
```
Learn how to estimate gas costs before sending transactions.

### Smart Account Examples
```bash
# Kernel smart account with sponsorship
pnpm kernel-sponsored

# Safe smart account with sponsorship  
pnpm safe-sponsored

# Custom sponsored transactions
pnpm custom-sponsored
```

---

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
  bundlerTransport: http(process.env.NEXT_PUBLIC_GELATO_RELAY_URL || ""),
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

## Testing on Different Networks

The SDK supports multiple test networks including Ink Sepolia, Arbitrum Sepolia, and Base Sepolia. The chain configurations are managed in `constants/chainConfig.ts`.

### Testing on Arbitrum Sepolia

To test on Arbitrum Sepolia:

1. Update your `.env` file with the appropriate RPC URL:
```
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

2. Modify your client configuration to use Arbitrum Sepolia:
```typescript
import { arbitrumSepolia } from 'viem/chains'
import { chainConfig } from '../constants/chainConfig'

// Create a smart wallet client for Arbitrum Sepolia
const smartWalletClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: arbitrumSepolia,
  transport: http(process.env.RPC_URL),
})
```

3. Available Payment Tokens:
   - Native ETH: Use for gas fees and native transactions
   - WETH: Available at `chainConfig.arbitrumSepolia.tokenContract`
   - USDC: Available at `chainConfig.arbitrumSepolia.usdcContract`

4. Example: Sending a transaction with WETH on Arbitrum Sepolia:
```typescript
import { chainConfig } from '../constants/chainConfig'

const tokenAddress = chainConfig.arbitrumSepolia.tokenContract

// Send WETH transaction
const hash = await smartWalletClient.writeContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x...', parseEther('0.1')],
})
```

5. Example: Sending a sponsored transaction:
```typescript
const sponsoredClient = await createSmartWalletClient({
  owner: privateKeyToAccount(process.env.PRIVATE_KEY!),
  chain: arbitrumSepolia,
  transport: http(process.env.RPC_URL),
  sponsorApiKey: process.env.SPONSOR_API_KEY,
})

const hash = await sponsoredClient.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
})
```

Important Notes:
- Get test ETH from the [Arbitrum Sepolia Faucet](https://sepolia-faucet.arbitrum.io/)
- For WETH transactions, use the `getWeth.ts` helper script to convert ETH to WETH
- For USDC transactions, get test USDC from the [Circle Faucet](https://faucet.circle.com/)
- Monitor your transactions on [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)


