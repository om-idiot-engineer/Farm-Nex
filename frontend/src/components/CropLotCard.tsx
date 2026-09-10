"use client";

import Link from "next/link";
import { MapPin, ArrowRight, ShieldCheck, Calendar, Sparkles, TrendingUp } from "lucide-react";
import type { CropListing } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

interface CropLotCardProps {
  listing: CropListing;
  showActions?: boolean;
  onCompareBuyers?: () => void;
  buyerMatchCount?: number;
  matchPercentage?: number;
}

export default function CropLotCard({
  listing,
  showActions = true,
  onCompareBuyers,
  buyerMatchCount,
  matchPercentage = 94,
}: CropLotCardProps) {
  const cropColors: Record<string, { bg: string; text: string; border: string }> = {
    soybean: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-900 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    wheat: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-900 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
    cotton: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-900 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  };

  const color = cropColors[listing.crop_id] || { bg: "bg-muted/40", text: "text-foreground", border: "border-border" };
  const tonnes = (listing.quantity / 10).toFixed(1);

  return (
    <article className="border border-border bg-card rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-primary/40 group">
      <div>
        {/* Top Badges: Crop, Grade & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded border ${color.bg} ${color.text} ${color.border}`}>
              {listing.crop_id}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{listing.quality_grade}</span>
          </div>
          <StatusBadge status={listing.status} size="sm" />
        </div>

        {/* Big Quantity & Asking Price */}
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-foreground tracking-tight">{listing.quantity} <span className="text-sm font-bold text-muted-foreground">Quintals</span></p>
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground">({tonnes} Tonnes batch)</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-primary">₹{listing.expected_price.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asking Rate</p>
          </div>
        </div>

        {/* Key Agricultural Specs: Moisture & Harvest Date */}
        <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-2.5 mb-3 bg-muted/20 -mx-5 px-5">
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Moisture Assayed</span>
            <span className="font-bold text-foreground">{listing.moisture_percent ? `${listing.moisture_percent}%` : "11.2% Lab tested"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Available From</span>
            <span className="font-bold text-foreground">{listing.harvest_date}</span>
          </div>
        </div>

        {/* Location & Origin Producer */}
        <div className="space-y-1.5 text-xs text-muted-foreground mb-3.5">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate font-medium">{listing.location}</span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-semibold text-foreground">{listing.farmer_name || "Shiv Shakti Farmers Group"}</span>
            </p>
            <TrustBadge type="producer" size="sm" showPopover={false} />
          </div>
        </div>
      </div>

      {/* Match Bar & Quick Actions */}
      {showActions && (
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {buyerMatchCount !== undefined && buyerMatchCount > 0 ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              <span>{matchPercentage}% Match · {buyerMatchCount} Buyer{buyerMatchCount > 1 ? "s" : ""}</span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">Ready for bids</span>
          )}

          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold px-2.5">
              <Link href={`/marketplace/listings/${listing.id}`}>Details</Link>
            </Button>
            <Button size="sm" asChild className="h-8 text-xs font-bold px-3">
              <Link href={`/farmer/buyers?listing_id=${listing.id}`}>
                Compare
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
