# Farm-Nex System Architecture

## 1. System Overview

**Farm-Nex** is a multi-sided digital agricultural marketplace and intelligence platform designed to eliminate opaque middlemen margins, provide transparent price discovery, and maximize farmer net earnings across India.

```
+-----------------------------------------------------------------------------------+
|                                  Client Tier                                      |
|            Next.js 14 App Router (TypeScript, Tailwind CSS, Recharts)             |
|                                                                                   |
|  +----------------+  +----------------+  +-------------+  +--------------------+  |
|  | Farmer Portal  |  |  Buyer Portal  |  | FPO Console |  | Admin/Intelligence |  |
|  +----------------+  +----------------+  +-------------+  +--------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                      HTTPS/REST
                                           |
+------------------------------------------v----------------------------------------+
|                               Backend API Service                                 |
|                  FastAPI (Python 3.12, Pydantic v2, SlowAPI)                      |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Matching Engine    |  | Price Intelligence |  | Auth & Security             |  |
|  | - Net Realization  |  | - Trend Analysis   |  | - JWT (HS256)               |  |
|  | - Haversine Freight|  | - Why Price Moved  |  | - Role-based Access Control |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Marketplace Engine |  | Trade Agreements   |  | Community Network           |  |
|  | - Listings/Demands |  | - Digital Contracts|  | - Verified Posts/Advisory   |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                   Database Adapter
                                           |
+------------------------------------------v----------------------------------------+
|                                Persistence Layer                                  |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |        Supabase (PostgreSQL)        |  |    In-Memory Fallback Datastore    |  |
|  |  - Production cloud persistence    |  |  - Zero-downtime offline testing   |  |
|  |  - Row Level Security (RLS)         |  |  - Pre-seeded evaluation scenarios |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Frontend Tier

The frontend is built with **Next.js 14** using the App Router, React Server/Client Components, and Tailwind CSS.

### Workspace Separation
- **Farmer Workspace (`/farmer`, `/farmer/produce`, `/farmer/buyers`, `/farmer/market`)**: Produce listing, Smart Sell recommendations, mandi price trends, and buyer discovery.
- **Buyer Workspace (`/buyer`, `/buyer/discover`, `/buyer/procurement`, `/buyer/deals`)**: Supply discovery, procurement requirements, and trade agreement workflow.
- **FPO Workspace (`/fpo`, `/fpo/supply`, `/fpo/logistics`, `/fpo/members`, `/fpo/analytics`)**: Aggregated member lots, collective logistics dispatch, and bulk contract fulfillment.
- **Consumer Workspace (`/consumer`, `/consumer/shop`, `/consumer/discover`, `/consumer/orders`)**: Direct-from-farm produce purchasing.
- **Market Intelligence (`/intelligence`)**: Mandi price trends, mandi arrivals, demand forecasting, and explanatory price-movement analysis.
- **Admin Console (`/admin`, `/admin/users`, `/admin/disputes`, `/admin/trust`, `/admin/marketplace`)**: Platform metrics, verification queue, dispute resolution, and map visualization.

---

## 3. Backend Tier

The backend is built with **FastAPI** (Python 3.12) emphasizing high throughput, modular routing, and strict Pydantic schemas.

### API Router Architecture
- `app/api/auth.py`: User registration (Buyer/Farmer/FPO), phone OTP verification, JWT token issuance, and `/auth/me` identity resolution.
- `app/api/marketplace.py`: Crop listings lifecycle, buyer demand requirements, and digital trade agreement state machines.
- `app/api/matching.py`: Farmer-to-buyer algorithmic matching with freight deductions.
- `app/api/intelligence.py`: Historical mandi price records, trend analysis, and causal price driver analytics.
- `app/api/community.py`: Peer-to-peer farmer discussions, expert verification badges, and advisory threads.
- `app/api/admin.py`: High-level platform KPIs, regional geospatial nodes, and moderation controls.

---

## 4. Matching Engine & Net Realization Algorithm

Rather than sorting buyers solely on nominal offer price, Farm-Nex calculates **Net Realization**—the actual take-home revenue a farmer receives after deducting logistics and platform fees.

### 4.1. Mathematical Formulation

For a given farmer crop listing of quantity $Q$ quintals at location $(\text{lat}_f, \text{lng}_f)$ and a buyer demand offer price $P_b$ at location $(\text{lat}_b, \text{lng}_b)$:

1. **Haversine Distance**:
   $$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_f)\cos(\phi_b)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$
   $$D = R \times \Delta\sigma \quad (\text{where } R = 6371\text{ km})$$

2. **Freight Logistics Cost**:
   $$\text{Freight Total} = \max\left(\text{MinCharge}, D \times Q \times R_{\text{freight}}\right)$$
   $$\text{Freight Per Quintal} = \frac{\text{Freight Total}}{Q}$$

3. **Platform Fee**:
   $$\text{Fee Per Quintal} = P_b \times r_{\text{platform}}$$

4. **Farmer Net Realization**:
   $$\text{Net Realization} = P_b - \text{Freight Per Quintal} - \text{Fee Per Quintal}$$

5. **Multi-Factor Ranking Score**:
   Matches are ranked using a multi-criteria weighted composite score:
   $$\text{Score} = w_{\text{net}} S_{\text{net}} + w_p S_p + w_d S_d + w_q S_q + w_{\text{qual}} S_{\text{qual}} + w_r S_r + w_a S_a$$

---

## 5. Persistence & Dual-Mode Datastore

- **Production Mode**: Connects directly to **Supabase** (PostgreSQL) using the Supabase client when `SUPABASE_URL` and `SUPABASE_KEY` are provided.
- **In-Memory Store Mode**: When external credentials are absent, the application automatically boots an in-memory datastore pre-seeded with real-world scenarios (e.g., Ramesh Patel in Indore, MP vs. buyers in Dewas, Bhopal, and Ujjain).
- All 19 backend unit and integration tests execute deterministically against this architecture without external cloud dependencies.

---

## 6. Security Model

1. **Zero Secret Leaks**: Configuration is completely externalized via `.env` files and environment variables; no credentials or keys are hardcoded.
2. **Cryptographic Signing**: Stateless authentication using JWT (`HS256`) with configurable expiration.
3. **Rate Limiting**: Configured using SlowAPI on public-facing authentication and transactional endpoints to protect against brute-force attacks.
4. **CORS Governance**: Configurable origin whitelist supporting local development and secure production deployments.
