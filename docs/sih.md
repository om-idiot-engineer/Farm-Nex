# Smart India Hackathon (SIH 2026) — Solution Overview

## 1. Hackathon Context & Problem Statement

Across agricultural supply chains in India, smallholder farmers face severe market inefficiencies:
- **Opaque Price Discovery**: Traditional mandi traders and commission agents (*arhtiyas*) often extract up to 15-25% in intermediaries' margins.
- **Nominal vs. Net Realization Illusion**: A buyer offering ₹5,050/quintal in a distant market often yields less profit than a local buyer offering ₹4,900/quintal once freight, handling, and transit shrinkage are deducted.
- **Fragmented Logistics**: Smallholders selling 10-20 quintals cannot afford full-truckload (FTL) transport, forcing them to sell locally at distressed prices.
- **Trust Deficit**: Direct farmer-to-buyer trade suffers from payment insecurity and non-standardized quality agreements.

---

## 2. The Farm-Nex Solution

**Farm-Nex** is a unified digital agricultural marketplace and intelligence ecosystem that connects farmers directly with bulk institutional buyers, food processors, and Farmer Producer Organizations (FPOs).

### Key Architectural Pillars

| Capability | Innovation | Impact |
|---|---|---|
| **Net Realization Engine** | Algorithmic ranking based on actual take-home revenue after deducting Haversine-computed freight and fees. | Prevents farmers from choosing misleadingly high nominal prices that result in lower net profit. |
| **Price & Demand Intelligence** | Real-time mandi price trends, arrival analysis, and causal "Why Price Moved" explanations. | Empowers farmers with institutional-grade market timing insights before harvesting or selling. |
| **FPO Aggregation** | Digital pooling of smallholder harvests into unified bulk supply lots. | Enables smallholders to access bulk commercial contracts and negotiated freight rates. |
| **Digital Trade Agreements** | Standardized, milestone-driven digital contracts with transparent dispute resolution. | Eliminates informal payment disputes and secures trade commitments. |
| **Dual-Mode Architecture** | Zero-downtime testable in-memory datastore with seamless cloud Supabase integration. | Ensures instantaneous live demonstration capability without external cloud latency or downtime risk. |

---

## 3. Core Evaluation Storyline

To evaluate the platform, Farm-Nex includes a pre-seeded representative scenario:

1. **Farmer**: Ramesh Patel (Indore, MP) listing 50 Quintals of Grade-A Soybean.
2. **Buyer Matching**:
   - *Dewas Agrocorp* (38 km away, ₹4,900/Q gross): Lower nominal price, but minimal freight costs. **Ranked #1 by Net Realization**.
   - *Bhopal Solvex* (190 km away, ₹5,050/Q gross): High nominal price, but ₹332.50/Q freight cost reduces net earnings below Dewas Agrocorp.
   - *Mahakal Feeds Ujjain* (55 km away, ₹4,750/Q gross): Local proximity fallback.
3. **Outcome**: The farmer transparently sees net returns and accepts the optimal trade agreement directly on the platform.

---

## 4. Verification & Quality Assurance

- **Unit & Integration Tests**: 19 automated tests covering Authentication, Matching Mathematics, Marketplace Contracts, Intelligence Endpoints, Admin Metrics, and Data Models.
- **Frontend Quality**: 42 routes compiled statically and dynamically on Next.js 14 App Router with zero build errors.
- **Security**: Strict zero-secret-tracking policy, JWT auth, and rate limiting.
