# AegisDot

> “AegisDot is an AI-powered transaction firewall for Web3, protecting wallets and cross-chain activity in real time.”

**Tagline:** AI-powered on-chain security layer for wallet transactions and Polkadot cross-chain activity.

---

## Project Overview
AegisDot is an autonomous security operations stack that continuously inspects wallet transactions and Polkadot XCM traffic. It blends a Python AI model, a Rust risk engine, and Solidity smart contracts to detect, score, and neutralize threats without human intervention.

## Key Features
- AI + Rust hybrid scoring of wallet transactions.
- Automatic on-chain defenses through `DefenseExecutor` and `GuardianVault`.
- Real-time monitoring of Polkadot hub runtime events via `@polkadot/api`.
- XCM risk analyzer with automatic mitigation when cross-chain risk exceeds 80.
- Rich React dashboard with live threat feed, defense history, attack simulator, and architecture view.

## Architecture
```
User Wallet
	↓
Transaction Analyzer
	↓
AI Risk Model (Python)
	↓
Rust Risk Engine
	↓
DefenseExecutor (Solidity)
	↓
GuardianVault → Polkadot Hub

Polkadot Hub
	↓
XCM Monitor (@polkadot/api)
	↓
XCM Risk Analyzer
	↓
Dashboard Alerts → DefenseExecutor
```

## System Workflow
1. Wallet transaction hits the backend Transaction Analyzer.
2. Calldata decoding identifies approvals/transfers and flags unlimited approvals.
3. Flags feed the Rust heuristic engine and Python AI model.
4. Weighted score yields LOW/MEDIUM/HIGH severity.
5. HIGH scores trigger on-chain updates via `RiskRegistry.updateRiskScore()` and `DefenseExecutor.evaluateAndDefend()` to secure funds inside `GuardianVault`.
6. Defense receipts are broadcast to the dashboard.

## XCM Monitoring Layer
- `xcmMonitor` subscribes to Substrate runtime events (XCM sections) through `@polkadot/api`.
- Events are normalized with destination chain, sender, amount, and timestamp metadata.
- `xcmRiskAnalyzer` scores each event: unknown destination (+30), large transfer (+40), rapid repeated sender (+20).
- Aggregate risk > 80 automatically triggers `DefenseExecutor.evaluateAndDefend()` and logs defense events.
- Dashboard cards (`XcmMonitor`, `XcmThreatAlerts`) visualize live telemetry and mitigation history.

## AI + Rust Risk Engine
- **Python AI System**: pandas-style feature extraction, ~4,800 labeled samples, trained model stored as `model.pkl` for CLI predictions.
- **Rust Engine**: `rust-risk-engine` applies deterministic heuristics for parity with on-chain logic; invoked via `cargo run` and parsed in Node.
- Backend combines both scores (0.6 AI / 0.4 Rust) for resilient detection even if one path fails (fallback heuristics included).

## Smart Contracts
- **GuardianVault**: final asset custody and emergency lockbox.
- **RiskRegistry**: authoritative ledger of wallet risk scores.
- **DefenseExecutor**: orchestrates mitigation actions (calling GuardianVault, updating risk, halting approvals). Contracts are developed with Hardhat and consumed via ethers v6.

## Dashboard Interface
- Wallet connect CTA + Defense pipeline hero block.
- Threat feed and defense event feed refreshed every 10 seconds.
- Metrics grid for threats, defenses, monitored wallets, and system state.
- Runtime and AI model health widgets.
- Attack Simulator to demonstrate detection + defense flows live.
- XCM monitor and threat alert cards with automatic defense indicators.

## Tech Stack
- **Smart Contracts**: Solidity, Hardhat.
- **Backend**: Node.js, Express.js, ethers v6, child-process bridges to Python & Rust.
- **AI**: Python, pandas, custom feature extraction scripts, virtualenv.
- **Rust**: Cargo project implementing risk heuristics.
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide icons.
- **Monitoring**: `@polkadot/api` WebSocket client, custom `xcmRiskAnalyzer`.

## Project Structure
```
AegisDot/
├── contracts/
├── backend/
├── frontend/
├── rust-risk-engine/
├── ai-risk-model/
├── scripts/
└── docs/
```

## Installation
```bash
git clone https://github.com/<your-org>/AegisDot.git
cd AegisDot

# Install root dependencies (Hardhat, shared tooling)
npm install

# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend
npm install

# Python virtualenv for AI model
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r ai-risk-model/requirements.txt
```

## Running the Project
1. **Launch backend**
	 ```bash
	 cd backend
	 npm start
	 ```
2. **Run Rust risk engine tests (optional)**
	 ```bash
	 cd rust-risk-engine
	 cargo test
	 ```
3. **Serve frontend**
	 ```bash
	 cd frontend
	 npm run dev
	 ```
4. **AI model prediction check**
	 ```bash
	 .venv/bin/python ai-risk-model/predict.py 1 0 1
	 ```

Ensure `.env` contains contract addresses (`GUARDIAN_VAULT_ADDRESS`, `RISK_REGISTRY_ADDRESS`, `DEFENSE_EXECUTOR_ADDRESS`) and `RPC_URL` for ethers.

## API Endpoints
| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Service heartbeat |
| `/api/analyze-transaction` | POST | Primary transaction risk analysis |
| `/api/simulate-attack` | POST | Demo attack simulator |
| `/api/defense-events` | GET | Defense history feed |
| `/api/xcm-events` | GET | Raw XCM events (latest 30) |
| `/api/xcm-threat-alerts` | GET | Aggregated XCM risk report + auto-defense status |

## Demo
- Live demo / video walkthrough: _Coming soon_
- Slides & architecture diagrams located in `docs/`.

## Future Improvements
- Expand AI dataset with on-chain real samples from multiple chains.
- Integrate zk-proof attestations for defense actions.
- Add mobile push notifications for wallet owners.
- Deploy dedicated indexer for parachain-specific XCM feeds.

## 📄 License
This project is released under the MIT License. See `LICENSE` for details.

---

**Built for the Polkadot Hackathon**
