"use client";

import React from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Layers3, 
  ArrowLeft, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function FpoAnalyticsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const comparisonData = [
    { crop: "Soybean (Yellow JS-335)", mandiRate: 4820, fpoRate: 5320, gainPerQ: 500, volumeQ: 1850 },
    { crop: "Wheat (Sharbati Grade-A)", mandiRate: 2850, fpoRate: 3180, gainPerQ: 330, volumeQ: 1400 },
    { crop: "Chana (Desi Bold)", mandiRate: 5600, fpoRate: 6150, gainPerQ: 550, volumeQ: 620 },
    { crop: "Maize (Yellow Commercial)", mandiRate: 2150, fpoRate: 2380, gainPerQ: 230, volumeQ: 950 },
  ];

  const totalGain = comparisonData.reduce((sum, item) => sum + (item.gainPerQ * item.volumeQ), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/fpo" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to FPO Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Collective Realization & Performance Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auditable economic impact report proving smallholder income uplift through aggregate pooling and direct institutional contracting.
          </p>
        </div>

        <Button asChild size="sm" className="bg-primary text-primary-foreground">
          <Link href="/fpo/deals">
            View Contract Payouts
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Economic impact calculations compare actual contracted procurement rates against daily APMC Indore mandi modal prices.
      </DemoNotice>

      {/* Top Uplift Highlight */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/40 p-6 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Cumulative Smallholder Member Surplus (FY 2025-26)
            </span>
            <p className="mt-1 text-3xl font-black text-emerald-950 dark:text-emerald-100 sm:text-4xl">
              ₹{totalGain.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              Net additional income transferred to 38 participating member families compared to selling individually at local mandi gates.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-emerald-200/80 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0 dark:border-emerald-900/80">
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Average Uplift</p>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">+11.2%</p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">On-Time Escrow Release</p>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">100%</p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Buyer Repeat Rate</p>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">92%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commodity-wise Realization Comparison */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-bold text-foreground">Commodity Realization vs APMC Mandi Modal</h2>
          <p className="text-xs text-muted-foreground">
            Price realized per quintal after deducting loading, standard bag packaging, and quality certification costs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Commodity & Grade</th>
                <th className="px-5 py-3 text-right">Pooled Volume</th>
                <th className="px-5 py-3 text-right">Avg. APMC Mandi Rate</th>
                <th className="px-5 py-3 text-right">FPO Contracted Net</th>
                <th className="px-5 py-3 text-right">Price Advantage</th>
                <th className="px-5 py-3 text-right">Total Net Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {comparisonData.map((item) => (
                <tr key={item.crop} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4 font-bold text-foreground">
                    {item.crop}
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {item.volumeQ.toLocaleString("en-IN")} Q
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground">
                    ₹{item.mandiRate.toLocaleString("en-IN")}/Q
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-foreground">
                    ₹{item.fpoRate.toLocaleString("en-IN")}/Q
                  </td>
                  <td className="px-5 py-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                    +₹{item.gainPerQ}/Q (+{((item.gainPerQ / item.mandiRate) * 100).toFixed(1)}%)
                  </td>
                  <td className="px-5 py-4 text-right font-black text-foreground">
                    ₹{(item.gainPerQ * item.volumeQ).toLocaleString("en-IN")}
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
