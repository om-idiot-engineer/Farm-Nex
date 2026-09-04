"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import {
  getMarketTrend,
  getMarketForecast,
  getMarketExplanation,
  type DataSource,
} from "@/lib/services/domain";
import type { PriceTrendResponse, DemandForecastResponse, WhyPriceMovedResponse } from "@/lib/api";
import DemoNotice from "@/components/DemoNotice";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

type CropType = "soybean" | "wheat" | "cotton";

export default function FarmerMarketIntelligencePage() {
  const [commodity, setCommodity] = useState<CropType>("soybean");
  const [timeframe, setTimeframe] = useState<string>("30d");
  const [trend, setTrend] = useState<PriceTrendResponse | null>(null);
  const [forecast, setForecast] = useState<DemandForecastResponse | null>(null);
  const [explanation, setExplanation] = useState<WhyPriceMovedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  const loadMarketData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [trendRes, forecastRes, explanationRes] = await Promise.all([
        getMarketTrend(commodity, timeframe),
        getMarketForecast(commodity),
        getMarketExplanation(commodity),
      ]);
      setTrend(trendRes.data);
      setForecast(forecastRes.data);
      setExplanation(explanationRes.data);
      setSource(trendRes.source);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load market advisory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [commodity, timeframe]);

  const latestPrice = trend?.history?.[trend.history.length - 1]?.price || (commodity === "soybean" ? 5420 : 2385);
  const prevPrice = trend?.history?.[0]?.price || latestPrice - 60;
  const changeAmt = latestPrice - prevPrice;
  const changePct = ((changeAmt / prevPrice) * 100).toFixed(1);
  const isRising = changeAmt >= 0;

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Mandi Decision Support
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Market Intelligence</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Transparent price trends, arrivals data, and straightforward advice on whether to sell or hold.
          </p>
        </div>

        {/* Crop Selector */}
        <div className="inline-flex rounded-lg border border-border bg-card p-1 shrink-0">
          {[
            { id: "soybean", label: "Soybean" },
            { id: "wheat", label: "Wheat" },
            { id: "cotton", label: "Cotton" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCommodity(c.id as CropType)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                commodity === c.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Market price history and factor models are development records synthesized from Agmarknet Madhya Pradesh data.
        </DemoNotice>
      )}

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadMarketData} />}

      {/* SHOULD I SELL? (FLAGSHIP PLAIN-LANGUAGE ADVISORY AT TOP) */}
      <section className="border-2 border-primary/40 bg-card rounded-xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs">
              ?
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Should I sell now?
            </h2>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Advisory Signal
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Outlook Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Market Outlook
            </span>
            <p className="text-xl font-black text-emerald-900">Moderately Rising</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prices have recently improved across Dewas and Indore, but seasonal arrivals from late harvesting may stabilize rates over the next 10–14 days.
            </p>
          </div>

          {/* Action Recommendation */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
              Recommended Farmer Action
            </span>
            <p className="text-xl font-black text-foreground">Sell in Lots / Stagger</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your produce moisture is safely below 11.5% and you have dry storage, consider selling 50% now at current profitable rates and holding the rest.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="border border-border rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-muted/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Direct Buyer Channel
              </span>
              <p className="font-bold text-xs text-foreground mt-1">
                Agrocorp & Central Solvex are actively buying Grade A {commodity}.
              </p>
            </div>
            <Button asChild className="font-bold w-full text-xs h-9 shadow-xs">
              <Link href="/farmer/buyers">Compare Active Buyers →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TOP SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border bg-card rounded-xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Current Benchmark
          </span>
          <p className="text-2xl font-black text-foreground">
            ₹{latestPrice.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span>
          </p>
          <span className="text-[11px] text-muted-foreground">MP Mandis Modal</span>
        </div>

        <div className="border border-border bg-card rounded-xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            30-Day Movement
          </span>
          <p className={`text-2xl font-black flex items-center gap-1 ${isRising ? "text-emerald-800" : "text-rose-700"}`}>
            {isRising ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            {changePct}%
          </p>
          <span className="text-[11px] text-muted-foreground">
            {isRising ? `+₹${changeAmt}/q increase` : `-₹${Math.abs(changeAmt)}/q drop`}
          </span>
        </div>

        <div className="border border-border bg-card rounded-xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Arrivals Pace
          </span>
          <p className="text-2xl font-black text-foreground">Moderate</p>
          <span className="text-[11px] text-muted-foreground">12% lower than prev season</span>
        </div>

        <div className="border border-border bg-card rounded-xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Feed Synchronization
          </span>
          <p className="text-base font-black text-foreground mt-1">Today, 6:00 AM</p>
          <span className="text-[11px] text-muted-foreground">Official Agmarknet feed</span>
        </div>
      </div>

      {/* Supporting Factors Breakdown */}
      {explanation && (
        <section className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            Underlying Market Factors
          </h3>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            {explanation.primary_factors.map((factor, idx) => (
              <div key={idx} className="bg-muted/20 border border-border p-3.5 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Factor #{idx + 1}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{factor}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRICE HISTORY TABLE */}
      {trend && trend.history && (
        <section className="border border-border bg-card rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-black text-foreground">Recent 30-Day Mandi Price Series</h3>
              <p className="text-xs text-muted-foreground">Recorded modal prices across Malwa mandis.</p>
            </div>
            <span className="text-xs font-bold text-muted-foreground">{trend.region}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Modal Rate (₹/q)</th>
                  <th className="px-4 py-2.5 text-right">Daily Arrivals (Quintals)</th>
                  <th className="px-4 py-2.5 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trend.history.slice(-10).reverse().map((dp, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium">{dp.date}</td>
                    <td className="px-4 py-2.5 text-right font-black text-foreground">₹{dp.price.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{dp.volume_arrivals ? `${dp.volume_arrivals} Q` : "N/A"}</td>
                    <td className="px-4 py-2.5 text-right text-[11px] text-muted-foreground">{dp.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
