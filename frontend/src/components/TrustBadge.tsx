"use client";

import { useState } from "react";
import { ShieldCheck, Info, CheckCircle2, Award, Building2 } from "lucide-react";
import { ReliabilityScoreCard, ReliabilityScore } from "./ReliabilityScoreCard";

interface TrustBadgeProps {
  type?: "producer" | "buyer" | "fpo" | "expert";
  size?: "sm" | "md";
  showPopover?: boolean;
  score?: ReliabilityScore;
}

export default function TrustBadge({
  type = "producer",
  size = "md",
  showPopover = true,
  score,
}: TrustBadgeProps) {
  const [open, setOpen] = useState(false);

  const configs = {
    producer: {
      label: "Verified Farmer",
      subtitle: "Identity & Land Records Verified",
      icon: ShieldCheck,
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
      description: "Identity verified through Government Aadhaar verification, local FPO endorsement, and successful weighbridge delivery records.",
      signals: ["Aadhaar KYC Completed", "Local FPO Member Endorsed", "98% On-Time Delivery Record"],
    },
    buyer: {
      label: "Verified Buyer",
      subtitle: "GST & Commercial Verification",
      icon: Building2,
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
      description: "Business entity verified via Active GSTIN validation, physical processing mill registration, and confirmed bank escrow history.",
      signals: ["Active GSTIN Verified", "Commercial Plant Registered", "<24h Payment Settlement Record"],
    },
    fpo: {
      label: "Verified FPO",
      subtitle: "Registered Farmer Collective",
      icon: Award,
      badgeClass: "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100",
      description: "Incorporated under Companies Act / Cooperative Society Act with an active board, collection hubs, and audited smallholder roster.",
      signals: ["Incorporation Certificate Verified", "Active Collection Centers", "Transparent Member Allocation"],
    },
    expert: {
      label: "Verified Agronomist",
      subtitle: "Credentials Validated",
      icon: Award,
      badgeClass: "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100",
      description: "Credentials verified with an agricultural university or research institution. Advisories adhere to ICAR post-harvest protocols.",
      signals: ["M.Sc / Ph.D. Agronomy Verified", "ICAR Protocol Compliance", "Community Quality Endorsed"],
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => showPopover && setOpen(!open)}
        className={`inline-flex items-center gap-1 font-semibold border transition-colors rounded-md ${
          size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
        } ${config.badgeClass}`}
        title="Click to view verification details"
      >
        <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        <span>{config.label}</span>
        {showPopover && <Info className="h-2.5 w-2.5 opacity-60 ml-0.5" />}
      </button>

      {open && showPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-card border border-border rounded-lg shadow-xl p-4 text-left animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-2 border-b border-border pb-2.5 mb-2.5">
              <Icon className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-bold text-foreground">{config.label}</p>
                <p className="text-[10px] text-muted-foreground">{config.subtitle}</p>
              </div>
            </div>

            {score ? (
              <div className="mb-4">
                <ReliabilityScoreCard score={score} />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {config.description}
                </p>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Verification signals
                  </p>
                  {config.signals.map((signal) => (
                    <div key={signal} className="flex items-center gap-1.5 text-[11px] text-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-3 pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
