"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Building2, 
  FileText, 
  Award,
  Sparkles,
  Search
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function AdminTrustAuditPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const auditSignals = [
    {
      domain: "Government Aadhaar & Land Records",
      score: "99.2%",
      auditedCount: 248,
      status: "Compliant",
      notes: "Integrated with MP Bhulekh land registry API for title and plot acreage confirmation.",
    },
    {
      domain: "Certified Weighbridge Calibration",
      score: "98.4%",
      auditedCount: 18,
      status: "Compliant",
      notes: "Annual legal metrology stamped certification verified on all partner collection centers.",
    },
    {
      domain: "Moisture Sensor Telemetry",
      score: "96.7%",
      auditedCount: 34,
      status: "Compliant",
      notes: "Cross-calibrated with NABL lab reference samples across JS-335 and Sharbati varieties.",
    },
    {
      domain: "GSTIN Active Status & Tax Filing",
      score: "100%",
      auditedCount: 42,
      status: "Compliant",
      notes: "Daily automated GST Portal e-invoice compliance check on all active institutional buyers.",
    }
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
            Trust & Quality Assurance Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit verification signals across land records, partner weighbridges, testing equipment, and commercial buyer GSTIN filings.
          </p>
        </div>

        <Button asChild size="sm" className="bg-primary text-primary-foreground">
          <Link href="/admin/users">
            Audit User KYC
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Verification signals feed directly into the TrustBadge popover so counterparties can independently verify trade qualifications.
      </DemoNotice>

      {/* Trust Signal Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {auditSignals.map((signal) => (
          <div key={signal.domain} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Audit Signal</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{signal.domain}</h3>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {signal.score}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {signal.notes}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span>Audited Entities: <strong>{signal.auditedCount}</strong></span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> {signal.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
