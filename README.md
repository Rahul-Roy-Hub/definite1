# DeFinite1

## 💡 Inspiration

DeFinite1 was born from a vision to empower DAOs, startups and DeFi-savvy individuals with a unified, non‑custodial treasury dashboard. The challenge: managing multi-chain balances, optimizing trades and automating treasury operations-without compromising self‑custody or imposing friction.

## 💻 What it does

DeFinite1 helps users seamlessly monitor and manage on‑chain holdings across EVM networks, execute optimized token swaps, perform cross‑chain transfers and simulate trades to mitigate risks-all while keeping assets under the user’s control.

## ⚙️ How we built it

- Frontend: Next Js
- Backend / API Integration: calls into 1inch Fusion, Fusion+, Swap, Balance, Spot Price, Token, Portfolio and Transaction Gateway APIs to orchestrate optimal trade execution and portfolio insights

## Use of 1inch APIs

- Swap API (classic mode): fetch real‑time quotes, route splits across liquidity sources for best price and minimal gas 
- Fusion API: gasless intent‑based swaps executed by resolvers with MEV protection, Dutch auction pricing, deep liquidity from CEXes and DEX aggregators, near‑instant response
- Fusion+ API: trustless cross-chain swaps via atomic swap architecture, timelocks, hashlocks, escrow, and resolver-executed gasless flows
- Balance API: consolidated balances and allowances across chains (< 400 ms), supports 12 EVM networks
- Spot Price API: real‑time token values in native currency or USD for fiat delta calculations
- Transaction Gateway API: broadcast transactions securely, including private/flashbots paths, shielding users from MEV risks
- Portfolio API: aggregates and presents detailed information for web3 assets across multiple wallets and chains
- Token API: comprehensive token information and allows users to search for token data using a token’s name, address, or symbol

