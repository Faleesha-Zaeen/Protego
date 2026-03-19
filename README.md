# Protego — AI Security Firewall for Web3

> The security layer every Polkadot dApp needs. Protego inspects 
> transactions before signatures land on-chain, enforces risk limits 
> via a PVM smart contract, and triggers automated on-chain defenses 
> when threats are detected.
>
>
>   **Live dApp:** https://protego-3oeb.vercel.app
>   **Cross-VM Proof TX:** [0x9890fd...209e9](https://blockscout-testnet.polkadot.io/tx/0x9890fd9602ec8db8bb99943760d91b85046129360e25f87c1ad481b318d209e9)

## What Protego Does

Most Web3 users blindly sign transactions. Once signed, malicious 
approvals and large transfers are irreversible. Protego sits between 
the user and the chain — analyzing calldata, scoring risk via an 
on-chain PVM contract, and blocking threats before they execute.

**This is infrastructure. Every dApp in the Polkadot ecosystem needs 
Protego to protect its users.**

## Architecture

```
User Transaction
      │
      ▼
 AI Risk Model (off-chain, LogisticRegression 0.92 accuracy)
      │
      ▼
 DefenseExecutor.sol (EVM) ──cross-VM call──▶ RiskEngine (PVM/PolkaVM)
      │                                            │
      │                                    Returns risk score 0-100
      │
      ├── score > 70 → GuardianVault.secureTransfer() → BLOCKED
      └── score ≤ 70 → ALLOWED
      
 XCM Monitor → detects cross-chain threats → logs to RiskRegistry
```

## Track 2 — PVM Smart Contract

Protego is a genuine EVM ↔ PVM cross-VM project:

- `RiskEngine.sol` compiled with **resolc** to **PolkaVM bytecode**
- `DefenseExecutor.sol` (EVM/Solidity) calls `RiskEngine` (PVM) 
  on-chain via cross-VM call
- Verified cross-VM transaction on Polkadot Hub TestNet:
  [`0x9890fd9602ec8db8bb99943760d91b85046129360e25f87c1ad481b318d209e9`](https://blockscout-testnet.polkadot.io/tx/0x9890fd9602ec8db8bb99943760d91b85046129360e25f87c1ad481b318d209e9)

## Deployed Contracts (Polkadot Hub TestNet)

| Contract | Address | Type |
|---|---|---|
| RiskEngine | `0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9` | PVM (PolkaVM) |
| DefenseExecutor | `0xf3b8cfF56A5c83D4e7ca36B0e35F6f67cabAC1F2` | EVM (Solidity) |
| GuardianVault | `0xDBC63E7c1C244D5D0359Be41F8815592b8097619` | EVM (Solidity) |
| RiskRegistry | `0x42Cc0cfD29D8d57BcAFB479B60900D362aC5b63A` | EVM (Solidity) |

Network: Polkadot Hub TestNet (Paseo)
- Chain ID: `420420417`
- RPC: `https://eth-rpc-testnet.polkadot.io/`
- Explorer: [Blockscout TestNet](https://blockscout-testnet.polkadot.io)

## Quick Start

### Prerequisites
- Node.js 22+
- MetaMask with Polkadot Hub TestNet configured
- Python 3.13+ (for AI model)

### 1. Add Polkadot Hub TestNet to MetaMask

| Setting | Value |
|---|---|
| RPC URL | `https://eth-rpc-testnet.polkadot.io/` |
| Chain ID | `420420417` |
| Symbol | `PAS` |
| Explorer | `https://blockscout-testnet.polkadot.io` |

### 2. Install & Run

```bash
# Clone
git clone https://github.com/Faleesha-Zaeen/Protego
cd Protego

# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Open http://localhost:5173
```

### 3. Try It

1. Open the dashboard — auto-simulation runs immediately
2. Connect your MetaMask wallet
3. Click "Simulate Malicious Transaction" 
4. Watch: AI scores the tx → DefenseExecutor calls PVM RiskEngine 
   → score returned → GuardianVault blocks the threat
5. Check Defense Events for on-chain confirmation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, wagmi |
| Backend | Node.js, Express |
| AI Model | scikit-learn LogisticRegression (accuracy: 0.92) |
| EVM Contracts | Solidity 0.8.20, Hardhat |
| PVM Contract | Solidity → resolc → PolkaVM bytecode |
| Cross-VM | DefenseExecutor (EVM) calls RiskEngine (PVM) |
| XCM | Polkadot.js WebSocket subscription |
| Network | Polkadot Hub TestNet (chain 420420417) |
| Tests | 105/105 passing on Polkadot Hub TestNet |

## Testing

Run the full test suite on Polkadot Hub TestNet:

```bash
npx hardhat test --network polkadotTestnet
```

Result: 105/105 passing on live testnet

## Smart Contracts

### RiskEngine (PVM)
Compiled with `resolc` to PolkaVM bytecode. Deployed on Polkadot Hub.
```solidity
function assessRisk(bytes calldata txCalldata) 
    external pure returns (uint8 score)
```
Scores 0-100: unlimited approval (+40), large transfer (+30), 
unknown contract (+20).

### DefenseExecutor (EVM)
Solidity contract that calls RiskEngine via cross-VM call.
```solidity
function evaluateAndDefend(address user, bytes calldata txCalldata) 
    external returns (uint8 score)
```
If score > 70: triggers GuardianVault.secureTransfer().

### GuardianVault (EVM)
Custody contract. Holds funds and executes secure transfers 
during defense actions.

### RiskRegistry (EVM)
On-chain risk score registry. Stores wallet risk scores updated 
by the backend and DefenseExecutor.

## AI Risk Model

Off-chain logistic regression model trained on 10,000 synthetic 
transactions. Outputs continuous probability score 0-100.

- Accuracy: 0.92
- Features: unlimited_approval, large_transfer, unknown_contract, 
  token_transfer, approval_amount
- Combined with on-chain PVM scoring for two-layer protection

## Rust Risk Engine

Reference implementation of Protego's PVM risk scoring 
precompile in `rust-risk-engine/src/lib.rs`.

Implements the same scoring logic as RiskEngine.sol in Rust, 
targeting PolkaVM (RISC-V). Planned for on-chain deployment 
as a custom precompile when PolkaVM runtime supports custom 
precompile registration.

## Why Polkadot?

Protego is built specifically for Polkadot because:
1. **PVM enables on-chain enforcement** — risk logic runs in PolkaVM, 
   non-bypassable by anyone
2. **XCM creates cross-chain attack surface** — Protego monitors 
   XCM events for suspicious patterns
3. **Every parachain dApp needs this** — Protego is ecosystem 
   infrastructure, not a single-app feature

## License
MIT
