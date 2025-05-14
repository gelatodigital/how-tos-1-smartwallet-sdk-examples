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

## Running Examples

### Native Payment Example

```bash
pnpm native
```

### ERC20 Payment Example

```bash
pnpm erc20
```

### Gas Estimates Example

```bash
pnpm estimate
```

### Sponsored Transaction Example

```bash
pnpm sponsored
```

### Kernel Sponsored Transaction Example

```bash
pnpm kernel-sponsored
```
