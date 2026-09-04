"use client";

import Link from "next/link";
import { Award, MapPin, Truck, CheckCircle2, Building2, MessageSquare, ArrowRight, ShieldCheck, Scale, Check } from "lucide-react";
import type { BuyerMatchOpportunity } from "@/lib/api";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

interface BuyerMatchCardProps {
  opportunity: BuyerMatchOpportunity;
  isTopMatch?: boolean;
  onAccept: (opp: BuyerMatchOpportunity) => void;
  onCounterOffer: (opp: BuyerMatchOpportunity) => void;
  isAccepting?: boolean;
}

export default function BuyerMatchCard({
  opportunity,
  isTopMatch = false,
  onAccept,
  onCounterOffer,
  isAccepting = false,
}: BuyerMatchCardProps) {
  const serviceCostPerQ = 35;

  return (
    <article
      className={`border rounded-lg bg-card shadow-sm transition-all overflow-hidden ${
        isTopMatch ? "border-primary/60 ring-2 ring-primary/20 shadow-md" : "border-border"
      }`}
    >
      {isTopMatch && (
        <div className="bg-primary text-primary-foreground px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            #1 Best Net Realization Deal
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">
            Matches Your Full Lot
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-6">
        {/* Header: Buyer info & Trust */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-foreground">{opportunity.business_name}</h3>
              <TrustBadge type="buyer" size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {opportunity.distance_km} km distance
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                <Truck className="h-3.5 w-3.5" />
                Farm-gate pickup provided
              </span>
              <span>·</span>
              <span className="text-foreground font-semibold">
                Payment within 24h
              </span>
            </div>
          </div>

          <div className="sm:text-right bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 sm:min-w-[220px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Net Realization (In Hand)
            </span>
            <p className="text-3xl font-black text-emerald-800 tracking-tight">
              ₹{opportunity.net_realization_per_quintal.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted-foreground">/q</span>
            </p>
            <p className="text-xs font-bold text-foreground mt-0.5">
              Total Payout: ₹{opportunity.net_total_realization.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Clear Financial Arithmetic Stack (No hidden math) */}
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Transparent Payout Formula
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Gross Buyer Bid</span>
              <span className="text-base font-black text-foreground">₹{opportunity.offered_price_per_quintal.toLocaleString("en-IN")}/q</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Freight Deducted</span>
              <span className="text-base font-black text-rose-700">-₹{opportunity.estimated_logistics_per_quintal}/q</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Platform / Handling</span>
              <span className="text-base font-black text-rose-700">-₹{serviceCostPerQ}/q</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Lot Volume</span>
              <span className="text-base font-black text-primary">{opportunity.quantity_matched} Quintals</span>
            </div>
          </div>
        </div>

        {/* Key decision factors */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            {isTopMatch ? "Why this deal ranks #1" : "Match highlights"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {opportunity.why_this_offer.map((reason, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border text-xs text-foreground font-medium">
                <Check className="h-3 w-3 text-primary shrink-0" />
                <span>{reason}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/profile/${opportunity.buyer_id}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Buyer Credentials & Weighbridge History →
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <Link href={`/messages?conversation=demo-conversation-agrocorp`}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Message
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCounterOffer(opportunity)}
            >
              Counter Offer
            </Button>
            <Button
              size="sm"
              className="font-bold px-5 h-9 shadow-sm"
              onClick={() => onAccept(opportunity)}
              disabled={isAccepting}
            >
              {isAccepting ? "Executing Deal..." : "Accept Deal"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
