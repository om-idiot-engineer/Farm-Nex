"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Users, 
  ArrowLeft, 
  DollarSign, 
  Truck, 
  ShieldCheck,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAdminOverview } from "@/lib/services/domain";
import type { AdminKPIData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import HeatmapWidget from "@/components/HeatmapWidget";

export default function AdminAnalyticsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [stats, setStats] = useState<AdminKPIData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user || !hasAccess) return;
    async function fetchStats() {
      try {
        const res = await getAdminOverview();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchStats();
  }, [hasAccess, user]);

  if (loading || !user || !hasAccess || loadingData) {
    return <LoadingSkeleton variant="detail" />;
  }

  const commodityVolume = [
    { crop: "Soybean (Yellow JS-335)", supplyQ: 5400, demandQ: 6800, avgRate: 5320, state: "Deficit (High Demand)" },
    { crop: "Wheat (Sharbati & Lokwan)", supplyQ: 4200, demandQ: 3800, avgRate: 2950, state: "Balanced" },
    { crop: "Chana (Desi Bold)", supplyQ: 1800, demandQ: 2100, avgRate: 5850, state: "Deficit" },
    { crop: "Cotton (Medium Staple)", supplyQ: 950, demandQ: 1200, avgRate: 7200, state: "Deficit" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Operations Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Platform Supply-Demand Economics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Macro-level agricultural trade volume, regional commodity liquidity, and freight logistics optimization metrics across Central India.
          </p>
        </div>

        <Button asChild size="sm" className="bg-primary text-primary-foreground">
          <Link href="/admin/transactions">
            Escrow Volume Report
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Economic analytics combine real trade agreements, buyer demand orders, and simulated regional mandi modal prices.
      </DemoNotice>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Sourced</span>
          <p className="mt-2 text-2xl font-black text-foreground">
            {(stats?.total_trade_volume_quintals || 9240).toLocaleString("en-IN")} Q
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Physical produce volume</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cumulative Value</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            ₹{((stats?.total_trade_volume_quintals || 9240) * 5100 / 10000000).toFixed(2)} Cr
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Disbursed via direct escrow</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Freight Savings</span>
          <p className="mt-2 text-2xl font-black text-primary">
            ₹{stats?.total_estimated_logistics_savings_inr?.toLocaleString("en-IN") || "1,86,400"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Direct hub dispatch</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Market Nodes</span>
          <p className="mt-2 text-2xl font-black text-foreground">
            {(stats?.total_active_listings || 0) + (stats?.total_active_demands || 0)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Supply & RFQ clusters</p>
        </div>
      </div>

      {/* Commodity-wise Liquidity Balance */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-bold text-foreground">Commodity Supply vs Institutional Sourcing Demand</h2>
          <p className="text-xs text-muted-foreground">Aggregate Quintals currently available vs active buyer demand tenders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Commodity & Spec</th>
                <th className="px-5 py-3 text-right">Available Supply</th>
                <th className="px-5 py-3 text-right">Procurement Demand</th>
                <th className="px-5 py-3 text-right">Weighted Avg. Rate</th>
                <th className="px-5 py-3">Market Liquidity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {commodityVolume.map((item) => (
                <tr key={item.crop} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4 font-bold text-foreground">
                    {item.crop}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-foreground">
                    {item.supplyQ.toLocaleString("en-IN")} Q
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-foreground">
                    {item.demandQ.toLocaleString("en-IN")} Q
                  </td>
                  <td className="px-5 py-4 text-right font-black text-primary">
                    ₹{item.avgRate.toLocaleString("en-IN")}/Q
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      item.state.includes("Deficit")
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}>
                      {item.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
