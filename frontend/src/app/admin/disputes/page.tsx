"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Scale, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  MessageSquare,
  Lock
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAdminDisputes, resolveAdminDispute } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function AdminDisputesPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [disputes, setDisputes] = useState(() => getAdminDisputes().data);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleResolve = (id: string) => {
    resolveAdminDispute(id);
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: "Resolved" as const } : d));
    setSelectedCase(null);
  };

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
            Commercial Dispute Arbitration Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Impartial evidence-based review for produce tare weighbridge variances, moisture deductions, and quality grade mismatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            {disputes.filter(d => d.status !== "Resolved").length} Open Cases
          </span>
        </div>
      </div>

      <DemoNotice>
        Arbitration decisions lock or adjust digital escrow allocations based on physical NABL lab certificates and electronic weighbridge camera slips.
      </DemoNotice>

      {/* Disputes Table */}
      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-primary">
                    Dispute #{d.id}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-bold text-foreground">Contract #{d.dealId}</span>
                  <StatusBadge status={d.status} />
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">{d.reason}</h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Escrow Hold</span>
                <p className="text-lg font-black text-rose-600">₹{(d.disputedAmount || d.amount || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <span className="text-muted-foreground">Claimant:</span>
                <p className="font-bold text-foreground">{d.raisedBy || "Claimant"}</p>
                <span className="text-muted-foreground block pt-1">Opposing Party:</span>
                <p className="font-bold text-foreground">{d.against || "Opposing Party"}</p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <span className="text-muted-foreground">Evidence Submitted:</span>
                <p className="font-semibold text-foreground">
                  Weighbridge Slip #WB-8819 (Variance: -4.2 Quintals), NABL Moisture Sample (12.4% vs 11.0% contract spec).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <span className="text-muted-foreground">
                Opened on {d.createdAt || d.filedDate}
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={`/deals/ord-${(d.dealId || d.orderNumber || "deal").toLowerCase()}`}>
                    Inspect Deal Documents <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>

                {d.status !== "Resolved" && (
                  <Button 
                    onClick={() => handleResolve(d.id)}
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Enforce Resolution & Release Escrow
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
