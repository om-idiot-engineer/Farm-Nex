"use client";

import { Check } from "lucide-react";

interface OrderTimelineProps {
  status: string;
}

interface Milestone {
  key: string;
  label: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  { key: "matched", label: "Deal Agreed", desc: "Terms & rate locked" },
  { key: "trade_confirmed", label: "Buyer Confirmed", desc: "Digital contract signed" },
  { key: "pickup_scheduled", label: "Pickup Scheduled", desc: "Vehicle & driver assigned" },
  { key: "pickup_completed", label: "Loaded & Weighed", desc: "Farm weighment recorded" },
  { key: "in_transit", label: "In Transit", desc: "Dispatched to plant" },
  { key: "delivered", label: "Delivered", desc: "Received at mill gate" },
  { key: "payment_confirmed", label: "Payment Confirmed", desc: "Escrow funds released" },
  { key: "completed", label: "Completed", desc: "Final receipt archived" },
];

function getStageIndex(status: string): number {
  const normalized = status.toLowerCase();
  const index = MILESTONES.findIndex((m) => m.key === normalized);
  return index !== -1 ? index : 2; // default to pickup scheduled if unrecognized
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = getStageIndex(status);

  return (
    <div className="border border-border bg-card rounded-lg p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-black text-foreground">Transaction Execution Timeline</h3>
          <p className="text-xs text-muted-foreground">
            Data-driven stage milestones tracking contract verification, dispatch, and bank payout.
          </p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          Stage {currentIndex + 1} of {MILESTONES.length}
        </span>
      </div>

      {/* Desktop Horizontal Milestone Bar */}
      <div className="hidden lg:grid grid-cols-8 gap-2 relative">
        {MILESTONES.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative group">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-1 -z-0 transition-colors ${
                    idx <= currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}

              {/* Icon badge */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
              </div>

              <p
                className={`mt-2.5 text-xs font-bold leading-tight ${
                  isCurrent ? "text-primary font-black" : isDone ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile / Tablet Vertical Milestones */}
      <div className="lg:hidden space-y-4">
        {MILESTONES.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </div>
                {idx < MILESTONES.length - 1 && (
                  <div className={`w-0.5 h-7 my-1 ${idx < currentIndex ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
              <div className="pt-0.5">
                <p className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                  {step.label} {isCurrent && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded ml-1 font-semibold">Current</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
