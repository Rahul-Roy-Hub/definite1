# DeFinite1

## 💡 Inspiration

DeFinite1 was born from a vision to empower DAOs, startups, and DeFi-savvy individuals with a unified, non‑custodial treasury dashboard. The challenge: managing multi-chain balances, optimizing trades, and automating treasury operations-without compromising self‑custody or imposing friction.

## 💻 What it does

DeFinite1 helps users seamlessly monitor and manage on‑chain holdings across EVM networks, execute optimized token swaps, automate portfolio rebalancing, schedule recurring transactions, perform cross‑chain transfers, and simulate trades to mitigate risks-all while keeping assets under the user’s control.

## ⚙️ How we built it

- Frontend: Next Js
- Backend / API Integration: calls into 1inch Fusion, Limit Order, Swap, Balance, Spot Price, and Transaction Gateway APIs to orchestrate optimal trade execution and portfolio insights

## Use of 1inch APIs

- Swap API (classic mode): fetch real‑time quotes, route splits across liquidity sources for best price and minimal gas 
- Fusion API: gasless intent‑based swaps executed by resolvers with MEV protection, Dutch auction pricing, deep liquidity from CEXes and DEX aggregators, near‑instant response (< 400 ms)
- Limit Order API: schedule rate- or time-based orders with RFQ, conditional execution semantics-ideal for trailing stops and DCA
- Fusion+ API: trustless cross-chain swaps via atomic swap architecture, timelocks, hashlocks, escrow, and resolver-executed gasless flows
- Balance API: consolidated balances and allowances across chains (< 400 ms), supports 12 EVM networks
- Spot Price API: real‑time token values in native currency or USD for fiat delta calculations
- Transaction Gateway API: broadcast transactions securely, including private/flashbots paths, shielding users from MEV risks
- Shield API: optional security layer for simulating transactions, detecting scam tokens, AML & sanctions screening via Blockaid, TRM Labs, Etherscan Pro

## ToDo (temp.)

- [ ] Dashboard / Overview
    - High-level snapshot of portfolio performance and treasury health
    - Metrics: total AUM, asset allocation by token & chain, 24 h/7 d change trends
    - Recent activity: recent swaps, rebalances, cross‑chain transfers
    - Alert highlights: portfolio drift, large transactions, impending DCA events

- [ ] Portfolio / Assets
    - Detailed balance view across EVM chains, powered by Balance API + Spot Price API
    - Breakdown by token, chain, valuation in USD, % of total
    - Historical P/L and token-level KPI charts

- [ ] Swaps & Trading
    - UI to execute optimized trades: Classic, Fusion, or Fusion+ based on needs
    - Simulation mode: show live quote, estimated gas, expected slippage, risk alert using Spot Price + Quote + Shield APIs
    - Option to preview price impact and token risk flags pre‑execution

- [ ] Recurring & Scheduled Orders
    - DCA / auto-swap setup page leveraging Limit Order API
    - Configurable schedules (daily, weekly), thresholds and fallback alerting
    - Order status dashboard and history

- [ ] 5. Auto‑Rebalancer / Strate
    - Define target asset allocations, test rebalancing strategies
    - Schedule or trigger auto‑rebalance events
    - Visualize before/after portfolios, rebalance execution history

- [ ] 6. Cross‑Chain Transfers
    - Fusion+ based page to move funds between chains
    - Route configuration, preview fees and expected arrival amounts
    - Status tracking for atomic swap orders

- [ ] 7. Alert Center & Simulations
    - Central hub for alerts: allocation drift, large moves, pending orders
    - Simulation explorer: run what‑if scenarios
    - Custom notification settings

- [ ] 8. Transactions & History
    - Full log of all executed operations: swap, limit order, cross-chain transfers, cancelations
    - Exportable CSV and searchable/filterable event table

- [ ] 9. Reports & Insights
    - Automated summary reports (monthly/quarterly): asset allocation, inflows/outflows, P/L
    - Downloadable visual reports and CSVs for community transparency or accounting purposes

- [ ] 10. Risk & Compliance
    - Integration with Shield API to flag risky tokens or addresses
    - AML / scam token checks pre-transaction
    - Vault-level risk metrics and historical breach/flag events
