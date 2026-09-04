# Data Sources & Transparency Citation

## Problem Statement 26033 — SIH 2026

In strict accordance with the **Data Honesty Requirements**, this document records the real public sources, mandi coverage, and methodology used for the historical market prices seeded into **Farm-Nex**.

---

## 1. Primary Public Data Source
- **Origin**: Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, Government of India.
- **Portal**: [Agmarknet (Agricultural Marketing Information Network)](https://agmarknet.gov.in)
- **Data Series**: Daily Mandi Modal Prices (₹ per Quintal) and Market Arrival Volumes (Metric Tonnes).
- **Target Region**: **Madhya Pradesh (MP)**, India.
- **Selected Commodities**:
  1. **Soybean (Yellow)**: Mandi hubs across Malwa belt — Indore, Dewas, Ujjain, Sehore, Harda.
  2. **Wheat (Dara / Lokwan)**: Major wheat trading mandis — Indore, Vidisha, Bhopal, Sehore.
  3. **Cotton (Medium Staple)**: Nimar and Malwa cotton mandis — Khandwa, Khargone, Dhamnod.

---

## 2. Real vs Interpolated Data Breakdown

| Commodity | Date Range | Primary Mandi | Real Mandi Observations | Gap-Fill Methodology |
|---|---|---|---|---|
| **Soybean** | 12 Months (Sept 2025 – Aug 2026) | Indore & Dewas Mandi | Real weekly modal auction records from Agmarknet MP bulletins | Linear weekly interpolation for non-trading holidays / Sundays |
| **Wheat** | 12 Months (Sept 2025 – Aug 2026) | Sehore & Indore Mandi | Real Agmarknet daily mandi prices reflecting post-rabi harvest surge | Non-trading day forward fill |
| **Cotton** | 12 Months (Sept 2025 – Aug 2026) | Khandwa & Khargone Mandi | Real Agmarknet MSP and spot auction indices | Weekly weighted volume interpolation |

---

## 3. Statutory MSP (Minimum Support Price) Benchmarks (2025-26)
- **Soybean (Yellow)**: ₹4,892 / quintal
- **Wheat**: ₹2,275 - ₹2,425 / quintal
- **Cotton (Medium Staple)**: ₹7,121 / quintal

---

## 4. Algorithmic Transparency Guarantee
- **No random numbers are generated as AI predictions.**
- Forecasted prices are calculated through **Exponential Smoothing ($\alpha = 0.3$) and Rolling Weighted Moving Averages** over the actual Agmarknet historical series.
- Explanations in the *"Why is the price moving?"* module are **deterministic economic rule heuristics** comparing real arrival volume shocks ($\Delta V$) with price elasticity ($\Delta P$).
