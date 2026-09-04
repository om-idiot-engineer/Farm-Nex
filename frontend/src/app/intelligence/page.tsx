"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  type PriceTrendResponse,
  type DemandForecastResponse,
  type WhyPriceMovedResponse
} from "@/lib/api";
import { getMarketExplanation, getMarketForecast, getMarketTrend, type DataSource } from "@/lib/services/domain";
import DemoNotice from "@/components/DemoNotice";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  Info,
  Calendar,
  Sparkles,
  HelpCircle,
  Database,
  Scale
} from "lucide-react";

const MSP_BENCHMARKS = {
  soybean: { msp: 4892, label: "MSP: ₹4,892" },
  wheat: { msp: 2275, label: "MSP: ₹2,275" },
  cotton: { msp: 7121, label: "MSP: ₹7,121" },
};

export default function MarketIntelligencePage() {
  const { t } = useTranslation();

  const [commodity, setCommodity] = useState<"soybean" | "wheat" | "cotton">("soybean");
  const [timeframe, setTimeframe] = useState<"1m" | "3m" | "6m" | "1y">("6m");

  const [trendData, setTrendData] = useState<PriceTrendResponse | null>(null);
  const [forecastData, setForecastData] = useState<DemandForecastResponse | null>(null);
  const [whyMovedData, setWhyMovedData] = useState<WhyPriceMovedResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [showMethodology, setShowMethodology] = useState(false);
  const [source, setSource] = useState<DataSource>("api");
  const [errorMsg, setErrorMsg] = useState("");

  const loadIntelligence = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [trend, forecast, why] = await Promise.all([
        getMarketTrend(commodity, timeframe),
        getMarketForecast(commodity),
        getMarketExplanation(commodity),
      ]);
      setTrendData(trend.data);
      setForecastData(forecast.data);
      setWhyMovedData(why.data);
      setSource([trend, forecast, why].some((result) => result.source === "demo") ? "demo" : "api");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load market intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
  }, [commodity, timeframe]);

  const mspInfo = MSP_BENCHMARKS[commodity];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <Link
          href="/farmer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card px-3 py-1.5 rounded-lg border border-border transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <Activity className="w-3.5 h-3.5" />
          <span>Agmarknet Mandi Intelligence</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card rounded-xl p-5 sm:p-7 border border-border shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Market Intelligence & Advisory
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Historical Agmarknet mandi series, moving-average projections, and transparent sell vs hold guidance.
            </p>
          </div>

          {/* Commodity Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border">
            {[
              { id: "soybean", label: "Soybean", icon: "🌱" },
              { id: "wheat", label: "Wheat", icon: "🌾" },
              { id: "cotton", label: "Cotton", icon: "☁️" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCommodity(c.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  commodity === c.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {source === "demo" && (
          <DemoNotice>
            Market history and outlook are illustrative demo records synthesized from Agmarknet Madhya Pradesh data.
          </DemoNotice>
        )}
        {errorMsg && <ErrorState message={errorMsg} onRetry={loadIntelligence} />}

        {/* 1. SHOULD I SELL NOW? (TOP-LEVEL DECISION ENGINE) */}
        {forecastData && (
          <div className={`p-5 sm:p-6 rounded-xl border-2 ${
            forecastData.price_direction === "downward" 
              ? "bg-emerald-500/10 border-emerald-500/40" 
              : forecastData.price_direction === "upward"
              ? "bg-amber-500/10 border-amber-500/40"
              : "bg-blue-500/10 border-blue-500/40"
          }`}>
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <Scale className={`w-5 h-5 ${
                    forecastData.price_direction === "downward" ? "text-emerald-700" :
                    forecastData.price_direction === "upward" ? "text-amber-700" : "text-blue-700"
                  }`} />
                  <h2 className="text-lg font-black text-foreground">Should I Sell Now?</h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-card text-foreground border border-border">
                    Decision Support
                  </span>
                </div>
                
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {forecastData.price_direction === "downward" && "Yes. Market momentum is softening. Liquidating now locks in your net realization before prices potentially correct further."}
                  {forecastData.price_direction === "upward" && "Hold if possible. Statistical models project upward momentum over the next 30 days. Staggering sales may capture better margins."}
                  {forecastData.price_direction === "stable" && "Neutral. The market is stable. Proceed with selling if you have storage constraints or immediate liquidity needs."}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Based on statistical moving averages from Agmarknet modal auctions across Central India.</span>
                </div>
              </div>
              
              <Link
                href="/farmer/buyers"
                className={`px-6 py-3 rounded-lg font-bold text-xs shadow-sm transition whitespace-nowrap ${
                  forecastData.price_direction === "downward" 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : forecastData.price_direction === "upward"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Compare Matching Buyers →
              </Link>
            </div>
          </div>
        )}

        {/* 2. Key Price Metrics Cards */}
        {forecastData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Historical 30d Baseline */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                30-Day Mandi Baseline Avg
              </span>
              <div className="text-2xl font-black text-foreground">
                ₹{forecastData.historical_avg_price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-muted-foreground"> /Q</span>
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Benchmark over MP mandis
              </span>
            </div>

            {/* Forecast Projection */}
            <div className="p-4 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Forecasted 30-Day Rate
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 uppercase">
                  {forecastData.price_direction}
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-900 flex items-center gap-2">
                ₹{forecastData.forecasted_next_30d_price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-emerald-700"> /Q</span>
                {forecastData.price_direction === "upward" ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600 inline" />
                ) : forecastData.price_direction === "downward" ? (
                  <TrendingDown className="w-5 h-5 text-red-600 inline" />
                ) : (
                  <Activity className="w-5 h-5 text-muted-foreground inline" />
                )}
              </div>
              <span className="text-[11px] text-emerald-800 font-medium block">
                Confidence: {forecastData.confidence_level}
              </span>
            </div>

            {/* Government MSP Reference */}
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                Statutory MSP Floor (Govt)
              </span>
              <div className="text-2xl font-black text-amber-950">
                ₹{mspInfo.msp.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-amber-800"> /Q</span>
              </div>
              <span className="text-[11px] text-amber-700 font-medium block">
                Minimum Support Price 2025-26
              </span>
            </div>
          </div>
        )}

        {/* Forecast Methodology Explanation Popover/Toggle */}
        {forecastData && (
          <div className="p-4 bg-muted/20 rounded-xl border border-border text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Deterministic Moving Average Model</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMethodology(!showMethodology)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                {showMethodology ? "Hide Details" : "View Mathematical Formula"}
              </button>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {forecastData.explanation}
            </p>
            {showMethodology && (
              <div className="pt-2 border-t border-border mt-2 space-y-1">
                <code className="block bg-card p-2.5 rounded-lg border border-border font-mono text-[11px] text-foreground">
                  {forecastData.formula}
                </code>
                <span className="text-[10px] text-muted-foreground block">
                  Strictly adheres to data honesty: calculated directly from historical Agmarknet daily modal auctions.
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. Price Trend Chart (Recharts) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-foreground">
                Agmarknet Historical Price Trend
              </h2>
              <span className="text-xs text-muted-foreground">
                Daily Mandi Modal Auctions in Madhya Pradesh
              </span>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border text-xs font-semibold">
              {(["1m", "3m", "6m", "1y"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md uppercase transition-colors ${
                    timeframe === tf
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Chart Container */}
          <div className="h-72 w-full pt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Loading price series...
              </div>
            ) : trendData && trendData.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickFormatter={(str) => str.slice(5)}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card p-3 rounded-xl shadow-lg border border-border text-xs space-y-1">
                            <p className="font-bold text-foreground">{label}</p>
                            <p className="text-primary font-black text-sm">
                              Rate: ₹{data.price} / Quintal
                            </p>
                            {data.volume_arrivals && (
                              <p className="text-muted-foreground text-[11px]">
                                Mandi Arrivals: {data.volume_arrivals} Tonnes
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground pt-0.5 border-t border-border">
                              {data.source}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* MSP Benchmark Reference Line */}
                  <ReferenceLine
                    y={mspInfo.msp}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: mspInfo.label,
                      position: "insideTopRight",
                      fill: "#b45309",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#15803d" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No data points available.
              </div>
            )}
          </div>
        </div>

        {/* 3. "Why is the Price Moving?" Rule-Based Explainer Panel */}
        {whyMovedData && (
          <div className="p-5 sm:p-6 bg-muted/20 rounded-xl border border-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-base font-black text-foreground">
                  Why is the Price Moving?
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {whyMovedData.confidence_label}
              </span>
            </div>

            {/* Summary callout */}
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {whyMovedData.summary}
            </p>

            {/* Factors list */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Contributing Market Factors (Analyzed from Mandi Arrivals):
              </span>
              <div className="grid grid-cols-1 gap-2">
                {whyMovedData.primary_factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-card rounded-lg border border-border text-xs text-foreground flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Honesty Disclaimer */}
            <div className="pt-2 flex items-start gap-2 text-[10px] text-muted-foreground border-t border-border">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span>{whyMovedData.disclaimer}</span>
            </div>
          </div>
        )}

        {/* 4. Visible Data Source & Last Updated Timestamp */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              <strong>Source:</strong> {trendData?.data_source || "Agmarknet Mandi Open Data"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              Last Synchronized: {trendData ? new Date(trendData.last_updated).toLocaleDateString() : "Today"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
