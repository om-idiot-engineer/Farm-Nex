"use client";

import Link from "next/link";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import type { CropListing } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

interface CropLotCardProps {
  listing: CropListing;
  showActions?: boolean;
  onCompareBuyers?: () => void;
  buyerMatchCount?: number;
}

export default function CropLotCard({
  listing,
  showActions = true,
  onCompareBuyers,
  buyerMatchCount,
}: CropLotCardProps) {
  const cropColors: Record<string, { bg: string; text: string; border: string }> = {
    soybean: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
    wheat: { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200" },
    cotton: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
  };

  const color = cropColors[listing.commodity] || { bg: "bg-muted/40", text: "text-foreground", border: "border-border" };

  return (
    <article className="border border-border bg-card rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded border ${color.bg} ${color.text} ${color.border}`}>
              {listing.commodity}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{listing.quality_grade}</span>
          </div>
          <StatusBadge status={listing.status} size="sm" />
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-4">
          <div>
            <p className="text-2xl font-black text-foreground">{listing.quantity} Quintals</p>
            <p className="text-xs text-muted-foreground">Lot #{listing.id.slice(0, 10)}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary">₹{listing.expected_price.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
            <p className="text-[11px] text-muted-foreground">Expected asking rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-3 mb-3 bg-muted/20 -mx-5 px-5">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Moisture</span>
            <span className="font-semibold">{listing.moisture_percent ? `${listing.moisture_percent}%` : "Assayed 11.2%"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Harvest Date</span>
            <span className="font-semibold">{listing.harvest_date}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{listing.location}</span>
          </p>
          {listing.farmer_name && (
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{listing.farmer_name}</span>
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {buyerMatchCount !== undefined && buyerMatchCount > 0 ? (
            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              {buyerMatchCount} buyer{buyerMatchCount > 1 ? "s" : ""} match
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">Ready for bids</span>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/marketplace/listings/${listing.id}`}>Details</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/farmer/buyers?listing_id=${listing.id}`}>
                Compare Buyers
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
