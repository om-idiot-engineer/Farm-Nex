"use client";

import React from "react";
import Link from "next/link";
import { 
  DollarSign, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Building2,
  Lock,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAdminOverview } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function AdminTransactionsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const transactions = [
    {
      id: "TX-90218",
      contractId: "CTR-2026-089",
      buyer: "ITC Agri Business Division",
      seller: "Malwa Kisan Samriddhi FPC",
      commodity: "Soybean (500Q)",
      grossAmount: 2660000,
      platformFee: 26600,
      netDisbursement: 2633400,
      escrowState: "Escrow Locked (100% Funded)",
      status: "in_transit",
      date: "03 Mar 2026",
    },
    {
      id: "TX-90174",
      contractId: "CTR-2026-062",
      buyer: "Adani Wilmar Limited",
      seller: "Ramesh Patel (Farmer)",
      commodity: "Wheat (250Q)",
      grossAmount: 800000,
      platformFee: 8000,
      netDisbursement: 792000,
      escrowState: "Settled to Seller Account",
      status: "delivered",
      date: "01 Mar 2026",
    },
    {
      id: "TX-89942",
      contractId: "CTR-2026-041",
      buyer: "Kargil Feeds India",
      seller: "Nimar Maize Producers FPC",
      commodity: "Maize (750Q)",
      grossAmount: 1785000,
      platformFee: 17850,
      netDisbursement: 1767150,
      escrowState: "Settled to Seller Account",
      status: "delivered",
      date: "25 Feb 2026",
    }
  ];

  const totalPlatformVolume = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalFeesCollected = transactions.reduce((sum, tx) => sum + tx.platformFee, 0);

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
            Commercial Trades & Escrow Settlement
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide transaction monitor, digital escrow vault allocations, and facilitator fee retention ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" /> Export Financial Audit
          </Button>
        </div>
      </div>

      <DemoNotice>
        Escrow funds are maintained in partner bank multi-signatory digital custody until automated electronic weighbridge tare receipt match.
      </DemoNotice>

      {/* Escrow Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Settled Volume</span>
          <p className="mt-2 text-2xl font-black text-foreground">₹{(totalPlatformVolume / 100000).toFixed(2)} Lakh</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Across 3 verified commercial trades</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Escrow Locked in Transit</span>
          <p className="mt-2 text-2xl font-black text-amber-600">₹26.60 Lakh</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting delivery weighbridge slip</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform Facilitation (1.0%)</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">₹{totalFeesCollected.toLocaleString("en-IN")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Retained on gross settlement</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Active Trade Escrow Ledger</h2>
          <span className="text-xs font-bold text-emerald-600">Real-Time Escrow Vault</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Tx # & Date</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Seller Producer</th>
                <th className="px-5 py-3">Commodity</th>
                <th className="px-5 py-3 text-right">Gross Value</th>
                <th className="px-5 py-3 text-right">Platform Fee</th>
                <th className="px-5 py-3 text-right">Net Farmer Payout</th>
                <th className="px-5 py-3">Escrow Status</th>
                <th className="px-5 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4 font-mono font-bold text-foreground">
                    {tx.id}
                    <span className="block text-[10px] text-muted-foreground font-normal">{tx.date}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {tx.buyer}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {tx.seller}
                  </td>
                  <td className="px-5 py-4">
                    {tx.commodity}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-foreground">
                    ₹{tx.grossAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground">
                    ₹{tx.platformFee.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-right font-black text-primary">
                    ₹{tx.netDisbursement.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      tx.status === "delivered" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      <Lock className="h-3 w-3" />
                      {tx.escrowState}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="outline" size="sm" asChild className="text-xs h-7">
                      <Link href={`/orders/ord-${tx.contractId.toLowerCase()}`}>
                        Order <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
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
