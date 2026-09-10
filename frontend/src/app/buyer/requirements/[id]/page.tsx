"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Building2,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getProcurementRequirement } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";

export default function BuyerProcurementDetailPage() {
  const { user, loading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "rfq-soy-001";
  const rfqResult = getProcurementRequirement(id);

  const [activeTab, setActiveTab] = useState<"matches" | "quotes">("matches");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const rfq = rfqResult.data;
  const matches = rfq.matchedSuppliers || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/buyer/requirements" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to RFQ Manager
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {(rfq.quantityQuintals || rfq.quantity).toLocaleString("en-IN")}Q {rfq.crop_id || rfq.crop}
            </h1>
            <StatusBadge status={rfq.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            RFQ #{rfq.id} · Broadcast to registered growers and FPOs within 150km of {rfq.deliveryDestination || rfq.destination}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/buyer/discover">
              Explore More Lots
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href={`/messages?recipientId=demo-farmer&subject=Offer for RFQ ${rfq.id}`}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Direct Message Supplier
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Matched suppliers are ranked using multi-parameter scoring: distance-based freight, certified moisture compatibility, and past delivery fulfillment score.
      </DemoNotice>

      {/* RFQ Parameters Card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border bg-card p-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Rate</span>
          <p className="mt-1 text-xl font-black text-primary">₹{(rfq.targetPricePerQuintal || 5200).toLocaleString("en-IN")}/Q</p>
          <p className="text-[11px] text-muted-foreground">FOT Destination</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Moisture</span>
          <p className="mt-1 text-xl font-black text-foreground">{rfq.maxMoisturePercentage || 12}%</p>
          <p className="text-[11px] text-muted-foreground">Weighbridge deduction &gt;12%</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Facility</span>
          <p className="mt-1 text-sm font-bold text-foreground truncate">{rfq.deliveryDestination || rfq.destination}</p>
          <p className="text-[11px] text-muted-foreground">24/7 Unloading</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deadline</span>
          <p className="mt-1 text-sm font-bold text-foreground">{rfq.deadline || rfq.neededBy}</p>
          <p className="text-[11px] text-muted-foreground">{rfq.responseCount} quotes submitted</p>
        </div>
      </div>

      {/* Matched Suppliers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Matched Suppliers & Recommended Lots</h2>
            <p className="text-xs text-muted-foreground">
              Ranked by net landed cost and certified produce specification fit
            </p>
          </div>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {matches.length} Verified Matches
          </span>
        </div>

        <div className="space-y-3">
          {matches.map((match, idx) => {
            const estFreight = Math.round(match.distanceKm * 0.85);
            const landedRate = match.expectedPrice + estFreight;

            return (
              <div key={match.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{match.sellerName}</h3>
                      <TrustBadge
                        type={match.sellerRole === "fpo" ? "fpo" : "producer"}
                        size="sm"
                      />
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {match.qualityFitPercentage}% Spec Fit
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {match.location} ({match.distanceKm} km)
                      </span>
                      <span>•</span>
                      <span>Available Supply: <strong className="text-foreground">{match.availableQuantity} Quintals</strong></span>
                      <span>•</span>
                      <span>Reliability: <strong className="text-foreground">{match.reliabilityScore}%</strong></span>
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Landed Plant Cost</span>
                      <p className="text-xl font-black text-primary">
                        ₹{landedRate.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-muted-foreground">/Q</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Gate: ₹{match.expectedPrice} + Freight: ₹{estFreight}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link href={`/profile/${match.sellerId}`}>
                          Seller Profile
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                        <Link href={`/messages?recipientId=${match.sellerId}&subject=Counter-Offer for RFQ ${rfq.id}&rfqId=${rfq.id}&lotId=${match.lotId || ""}`}>
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Send Purchase Offer
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
