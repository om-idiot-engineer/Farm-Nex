"use client";

import Link from "next/link";
import { MapPin, Calendar, Truck, ArrowRight, Building2, ShieldCheck } from "lucide-react";
import type { DemandPost } from "@/lib/api";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

interface BuyerRequirementCardProps {
  demand: DemandPost;
  showActions?: boolean;
}

export default function BuyerRequirementCard({ demand, showActions = true }: BuyerRequirementCardProps) {
  const tonnes = (demand.quantity_needed / 10).toFixed(1);

  return (
    <article className="border border-border bg-card rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-primary/40 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded border bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              {demand.commodity}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{demand.quality_grade}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            Active Tender
          </span>
        </div>

        <div className="mb-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
              {demand.business_name || "Verified Processor"}
            </h3>
            <TrustBadge type="buyer" size="sm" showPopover={false} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{demand.location}</span>
          </p>
        </div>

        {/* Volume & Offered Rate Strip */}
        <div className="flex items-baseline justify-between gap-2 mb-3.5 bg-muted/20 border border-border/60 p-3 rounded-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">Required Volume</span>
            <p className="text-xl font-black text-foreground">{demand.quantity_needed} <span className="text-xs font-semibold text-muted-foreground">Q ({tonnes}T)</span></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">Offered Rate</span>
            <p className="text-xl font-black text-primary">₹{demand.offered_price.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <p className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Pickup: Farm-gate logistics available</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Settlement: {demand.payment_terms || "Within 24h Escrow Release"}</span>
          </p>
        </div>
      </div>

      {showActions && (
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Moisture max: {demand.moisture_max ? `${demand.moisture_max}%` : "12%"}
          </span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold px-2.5">
              <Link href={`/marketplace/requirements/${demand.id}`}>Inspect RFQ</Link>
            </Button>
            <Button size="sm" asChild className="h-8 text-xs font-bold px-3">
              <Link href={`/messages?conversation=demo-conversation-agrocorp`}>
                Negotiate
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
