"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s_-]+/g, "_");

  const styles: Record<string, { label: string; className: string }> = {
    // Produce status
    listed: { label: "Listed", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    active: { label: "Active", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    matched: { label: "Deal Agreed", className: "bg-blue-50 text-blue-800 border-blue-200" },
    trade_confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-800 border-blue-200" },
    pickup_scheduled: { label: "Pickup Scheduled", className: "bg-amber-50 text-amber-900 border-amber-200" },
    pickup_completed: { label: "Loaded & Weighed", className: "bg-amber-50 text-amber-900 border-amber-200" },
    in_transit: { label: "In Transit", className: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    delivered: { label: "Delivered", className: "bg-teal-50 text-teal-800 border-teal-200" },
    payment_confirmed: { label: "Payment Confirmed", className: "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-800 border-slate-300" },
    paused: { label: "Paused", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
    closed: { label: "Closed", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },

    // RFQ status
    draft: { label: "Draft", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
    broadcast: { label: "Broadcast", className: "bg-sky-50 text-sky-800 border-sky-200" },
    responses: { label: "Responses Received", className: "bg-amber-50 text-amber-800 border-amber-200 font-bold" },
    shortlisted: { label: "Shortlisted", className: "bg-purple-50 text-purple-800 border-purple-200" },
    negotiating: { label: "Negotiating", className: "bg-amber-50 text-amber-800 border-amber-200" },
    awarded: { label: "Awarded", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    fulfillment: { label: "Fulfillment", className: "bg-blue-50 text-blue-800 border-blue-200" },

    // FPO status
    pooled: { label: "Pooled Supply", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    partially_allocated: { label: "Partially Contracted", className: "bg-amber-50 text-amber-800 border-amber-200" },
    contracted: { label: "Fully Contracted", className: "bg-blue-50 text-blue-800 border-blue-200" },

    // Dispute / admin
    under_review: { label: "Under Review", className: "bg-rose-50 text-rose-800 border-rose-200 font-semibold" },
    open: { label: "Open Dispute", className: "bg-rose-50 text-rose-800 border-rose-200 font-semibold" },
    resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  };

  const config = styles[normalized] || {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded border uppercase tracking-wider ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${config.className}`}
    >
      {config.label}
    </span>
  );
}
