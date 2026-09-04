"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getDemands, getFpoSupply } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function FpoRequirementsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const demandsResult = getDemands();
  const supplyResult = getFpoSupply();

  const [search, setSearch] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("all");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="card" />;
  }

  const demands = demandsResult.data;
  const supplyLots = supplyResult.data;

  const filtered = demands.filter((d: any) => {
    const matchesSearch = (d.business_name || d.buyer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      d.commodity.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = selectedCommodity === "all" || d.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
    return matchesSearch && matchesCrop;
  });

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
            Institutional Buyer Procurement Demands
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bulk purchase tenders and recurring RFQs from verified processors, feed millers, and exporters seeking FPO pooled lots.
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/fpo/supply">
            View FPO Available Batches
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Submitting a collective quote links your pooled lot directly with the buyer&apos;s procurement officer via transaction chat.
      </DemoNotice>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by buyer, commodity, or delivery city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Crop:</span>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Commodities</option>
            <option value="Soybean">Soybean</option>
            <option value="Wheat">Wheat</option>
            <option value="Chana">Chana</option>
            <option value="Maize">Maize</option>
          </select>
        </div>
      </div>

      {/* Demands List */}
      <div className="space-y-4">
        {filtered.map((demand: any) => {
          // Check if FPO has matching lot
          const matchingLot = supplyLots.find(l => l.crop.toLowerCase().includes(demand.commodity.toLowerCase()));
          const totalEstValue = demand.quantity_needed * demand.offered_price;

          return (
            <div key={demand.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">
                      {demand.business_name || demand.buyer_name || "Institutional Buyer"}
                    </h3>
                    <TrustBadge type="buyer" size="sm" />
                    {matchingLot && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Supply Match ({matchingLot.quantity}Q ready)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Seeking: {demand.quantity_needed} Quintals {demand.commodity} ({demand.quality_grade})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Delivery to {demand.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Target Date: {demand.target_date}
                    </span>
                  </div>

                  {demand.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded">
                      Buyer Specifications: &ldquo;{demand.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Pricing and Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                      Offered Purchase Rate
                    </span>
                    <p className="text-2xl font-black text-primary">
                      ₹{demand.offered_price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground"> / Q</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Total Order Value: ₹{totalEstValue.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href={`/marketplace/requirements/${demand.id}`}>
                        View Full RFQ
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="bg-primary text-primary-foreground text-xs">
                      <Link href={`/messages?recipientId=${demand.user_id}&subject=FPO Collective Quote for ${demand.commodity}&lotId=${matchingLot?.id || ""}`}>
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Submit Collective Offer
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
  );
}
