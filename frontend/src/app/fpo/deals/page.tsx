"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Download, 
  ShieldCheck,
  Building2,
  Users
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFpoMembers } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function FpoDealsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const membersResult = getFpoMembers();

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="card" />;
  }

  const members = membersResult.data;

  // Active contracts for this FPO
  const contracts = [
    {
      id: "CTR-2026-089",
      buyer: "ITC Agri Business Division",
      commodity: "Soybean (JS-335)",
      quantity: 500,
      contractRate: 5320,
      totalValue: 2660000,
      status: "in_transit",
      escrowStatus: "Escrow Funded (100%)",
      collectionHub: "Sanwer Aggregation Hub",
      dispatchDate: "Yesterday",
      membersInvolved: 14,
    },
    {
      id: "CTR-2026-074",
      buyer: "Adani Wilmar Limited",
      commodity: "Wheat (Sharbati Grade-A)",
      quantity: 400,
      contractRate: 3180,
      totalValue: 1272000,
      status: "delivered",
      escrowStatus: "Settled to FPO Account",
      collectionHub: "Depalpur Primary Center",
      dispatchDate: "28 Feb 2026",
      membersInvolved: 11,
    }
  ];

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
            Contracts & Smallholder Payout Ledger
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor bulk institutional trade contracts, digital escrow releases, and transparent member-wise payout distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" /> Export Payout Excel
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/orders">
              Track Dispatches
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Escrow funds are held securely until digital weighbridge and moisture certification receipts are uploaded and approved.
      </DemoNotice>

      {/* Active Contracts */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-foreground">Active Institutional Contracts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Contract #{c.id}
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-0.5">{c.buyer}</h3>
                  <p className="text-xs text-muted-foreground">{c.quantity}Q {c.commodity}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Contract Rate:</span>
                  <p className="font-bold text-foreground">₹{c.contractRate.toLocaleString("en-IN")}/Q</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Contract Value:</span>
                  <p className="font-bold text-foreground">₹{c.totalValue.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Security:</span>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">{c.escrowStatus}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Participating Farmers:</span>
                  <p className="font-semibold text-foreground">{c.membersInvolved} Members</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground">Hub: {c.collectionHub}</span>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href={`/orders/ord-${c.id.toLowerCase()}`}>
                    View Order Details <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smallholder Payout Allocation Breakdown */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Member Payout Allocation (Contract #{contracts[0].id})</h2>
              <p className="text-xs text-muted-foreground">
                Itemized distribution of ₹5,320/Q realization minus 1.5% FPO administrative & grading retention.
              </p>
            </div>
            <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Direct Bank Transfer (DBT) Ready
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Member Name</th>
                <th className="px-5 py-3">Village</th>
                <th className="px-5 py-3 text-right">Yield Supplied</th>
                <th className="px-5 py-3 text-right">Gross Amount</th>
                <th className="px-5 py-3 text-right">FPO Retention (1.5%)</th>
                <th className="px-5 py-3 text-right">Net Farmer Payout</th>
                <th className="px-5 py-3 text-center">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.slice(0, 6).map((m, index) => {
                const supplied = index === 0 ? 60 : index === 1 ? 45 : 35;
                const gross = supplied * 5320;
                const fee = Math.round(gross * 0.015);
                const net = gross - fee;

                return (
                  <tr key={m.id} className="transition-colors hover:bg-muted/20 text-xs">
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {m.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {m.village}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {supplied} Q
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      ₹{gross.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      -₹{fee.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-primary">
                      ₹{net.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Clock className="h-3 w-3" /> Awaiting Delivery Confirmation
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
