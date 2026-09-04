"use client";

import Link from "next/link";
import { MapPin, Calendar, Truck, ArrowRight } from "lucide-react";
import type { DemandPost } from "@/lib/api";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

interface BuyerRequirementCardProps {
  demand: DemandPost;
  showActions?: boolean;
}

export default function BuyerRequirementCard({ demand, showActions = true }: BuyerRequirementCardProps) {
  return (
    <article className="border border-border bg-card rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded border bg-blue-50 text-blue-900 border-blue-200">
              {demand.commodity}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{demand.quality_grade}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Active Demand
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-base font-black text-foreground">{demand.business_name || "Verified Processor"}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TrustBadge type="buyer" size="sm" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-4 bg-muted/20 p-3 rounded -mx-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Needed Volume</span>
            <p className="text-xl font-black text-foreground">{demand.quantity_needed} Quintals</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Offered Rate</span>
            <p className="text-lg font-black text-primary">₹{demand.offered_price.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{demand.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Pickup available at farm-gate</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Terms: {demand.payment_terms || "Within 24h"}</span>
          </p>
        </div>
      </div>

      {showActions && (
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">Max moisture: {demand.moisture_max ? `${demand.moisture_max}%` : "12%"}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/marketplace/requirements/${demand.id}`}>Inspect RFQ</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/messages?conversation=demo-conversation-agrocorp`}>
                Message Buyer
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
