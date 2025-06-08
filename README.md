## Overview

ChainSignal is a free SaaS platform dashboard for Bitcoin on-chain analytics. ChainSignal bridges the gap between complex on-chain data and actionable insights, empowering small to medium investors with tools previously reserved for institutions. ChainSignal is a product from TGI Technologies. 

www.chainsignal.biz.id

## ChainSignal’s Differentiation Strategy

A. Core Innovations

Predictive Behavior Engine 

Uses AI to flag emerging trends (e.g., whale accumulation, miner capitulation) 12–48 hours before market shifts, similar to Merkle Science’s threat detection.
Integrates metrics like Miner Profit/Loss and Exchange Reserve Alerts.

Contextual Intelligence Layer

Overlays on-chain data with real-world events (e.g., ETF flows, regulatory news).
Visualizes correlations (e.g., "Fed rate hikes → BTC outflows").

Workflow Automation
No-code alert builders (e.g., "Notify me if >1,000 BTC moves to exchanges").
Zapier-style integrations with exchanges/TradingView 10.

B. User Experience Edge

Adaptive Dashboards: Beginners see pre-built templates (e.g., "Bull Market Signals"); pros access raw data.
WalletDNA™: Clusters wallets by behavior (e.g., "Long-term holders," "OTC services") using Allium’s Wallet360™ principles

## Architecture Stack

graph LR
A[React/Next.js Frontend] --> B[Next.js Middleware]
B --> C[Neon PostgreSQL DB]
B --> D[AI Microservice]
B --> E[Bitcoin Node/APIs]

## Core System Workflows

Real-time Alert Pipeline:
- Client sends metric subscription via WebSocket
- Next.js middleware processes incoming blocks
- Checks against user alert conditions in Neon DB
- Triggers notifications via serverless functions
- Updates UI via React context
