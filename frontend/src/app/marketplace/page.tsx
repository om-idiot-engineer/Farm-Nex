"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Filter, 
  Search, 
  Sprout, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  SlidersHorizontal, 
  Check, 
  Calendar, 
  Layers, 
  Scale, 
  DollarSign, 
  Clock, 
  Plus,
  LayoutGrid,
  List
} from "lucide-react";
import type { CropListing, DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getDemandPosts, getMarketplaceListings } from "@/lib/services/domain";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

type MarketplaceView = "supply" | "demand";

function MarketplaceContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as MarketplaceView) || "supply";
  const initialCrop = searchParams.get("crop") || "all";

  const [view, setView] = useState<MarketplaceView>(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [listingsRes, demandsRes] = await Promise.all([
          getMarketplaceListings(),
          getDemandPosts()
        ]);
        setListings(listingsRes.data || []);
        setDemands(demandsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch = 
      l.crop_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = selectedCrop === "all" || l.crop_id.toLowerCase() === selectedCrop.toLowerCase();
    const matchesLoc = selectedLocation === "all" || l.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesCrop && matchesLoc;
  });

  // Filter demands
  const filteredDemands = demands.filter((d) => {
    const matchesSearch = 
      d.crop_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = selectedCrop === "all" || d.crop_id.toLowerCase() === selectedCrop.toLowerCase();
    const matchesLoc = selectedLocation === "all" || d.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesCrop && matchesLoc;
  });

  const totalAvailableQty = listings.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalDemandQty = demands.reduce((sum, item) => sum + (item.quantity_needed || (item as any).quantity || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* 1. TRADING FLOOR HEADER & AGGREGATE STRIP */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Sprout className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              FarmNex Agricultural Trading Network
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Live Agricultural Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Transparent farm-gate supply and aggregated processor demand with zero broker deductions.
          </p>
        </div>

        {/* Aggregated Market Liquidity Metrics */}
        <div className="flex items-center gap-4 text-xs bg-muted/20 border border-border/80 p-3 rounded-xl shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Harvest Supply</span>
            <span className="font-black text-sm text-foreground tabular-nums">
              {totalAvailableQty.toLocaleString("en-IN")} Quintals
            </span>
          </div>
          <div className="h-7 w-px bg-border" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Processor Sourcing Demand</span>
            <span className="font-black text-sm text-primary tabular-nums">
              {totalDemandQty.toLocaleString("en-IN")} Quintals
            </span>
          </div>
        </div>
      </div>

      {/* 2. DUAL MODE TOGGLE (SUPPLY vs DEMAND - Section 17) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1.5 rounded-xl bg-muted/40 border border-border w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setView("supply")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              view === "supply"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sprout className={`h-4 w-4 ${view === "supply" ? "text-primary" : ""}`} />
            <span>SUPPLY · AVAILABLE HARVEST ({listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setView("demand")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              view === "demand"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className={`h-4 w-4 ${view === "demand" ? "text-primary" : ""}`} />
            <span>DEMAND · BUYER RFQS ({demands.length})</span>
          </button>
        </div>

        {/* View Layout Mode (Cards vs Table) */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
              viewMode === "cards" 
                ? "bg-card text-primary border-primary/40 shadow-2xs" 
                : "bg-muted/20 text-muted-foreground border-border hover:text-foreground"
            }`}
            title="Card View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
              viewMode === "table" 
                ? "bg-card text-primary border-primary/40 shadow-2xs" 
                : "bg-muted/20 text-muted-foreground border-border hover:text-foreground"
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. MULTI-DIMENSIONAL FILTER BAR (Section 17) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={view === "supply" ? "Search crops, farmer names, tehsils..." : "Search procurement RFQs, buyer entities, destination plants..."}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Crops</option>
              <option value="soybean">Soybean (Yellow)</option>
              <option value="wheat">Wheat (Sharbati)</option>
              <option value="cotton">Cotton (Medium Staple)</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Locations (Malwa)</option>
              <option value="indore">Indore Region</option>
              <option value="dewas">Dewas Industrial</option>
              <option value="ujjain">Ujjain Region</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                onlyVerified 
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300" 
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT (SUPPLY VS DEMAND) */}
      {loading ? (
        <LoadingSkeleton variant="card" rows={6} />
      ) : view === "supply" ? (
        filteredListings.length === 0 ? (
          <EmptyState
            title="No harvest lots match your criteria"
            description="Try loosening your filters or clear your search term to see all available farm lots."
            action="Clear Filters"
            href="/marketplace?view=supply"
            icon={Sprout}
          />
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((lot) => (
              <div 
                key={lot.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🌾</span>
                        <h3 className="text-lg font-black capitalize text-foreground">{lot.crop_id}</h3>
                        <TrustBadge type="producer" size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{lot.location.split(",")[0]} · Farm Gate</span>
                      </p>
                    </div>
                    <StatusBadge status={lot.status} size="sm" />
                  </div>

                  {/* Agricultural Specs Box */}
                  <div className="my-3.5 grid grid-cols-2 gap-2 bg-muted/20 border border-border/60 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Available Qty</span>
                      <span className="font-black text-foreground text-sm">{lot.quantity} Quintals</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Farm Gate Asking</span>
                      <span className="font-black text-primary text-sm">₹{lot.expected_price.toLocaleString("en-IN")}/Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Assay Grade</span>
                      <span className="font-bold text-foreground">{lot.quality_grade || "Grade A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Moisture Assay</span>
                      <span className="font-bold text-foreground">{lot.moisture_percent || 10.8}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Seller: <strong className="text-foreground font-semibold">Ramesh Patel (FPO)</strong></span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      Immediate Pickup
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-8 font-bold">
                    <Link href={`/marketplace/listings/${lot.id}`}>
                      Inspect Assay Slip
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs h-8 font-bold shadow-xs">
                    <Link href={`/messages?recipientId=demo-farmer&makeOffer=true&crop=${lot.crop_id}&lotId=${lot.id}`}>
                      Make Buyer Offer
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
            <table className="w-full min-w-[50rem] text-left text-xs">
              <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Crop & Lot ID</th>
                  <th className="px-4 py-3 text-right">Available Volume</th>
                  <th className="px-4 py-3">Quality Assay</th>
                  <th className="px-4 py-3 text-right">Farm-Gate Rate</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-center">Verification</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map((lot) => (
                  <tr key={lot.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-foreground capitalize block">{lot.crop_id}</span>
                      <span className="text-[10px] text-muted-foreground">#{lot.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-foreground">
                      {lot.quantity} Quintals
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lot.quality_grade || "Grade A"} · {lot.moisture_percent || 10.8}% Moisture
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-primary text-sm">
                      ₹{lot.expected_price.toLocaleString("en-IN")}/Q
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lot.location.split(",")[0]}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Certified
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button asChild size="sm" className="text-xs h-7 font-bold">
                        <Link href={`/marketplace/listings/${lot.id}`}>View Lot</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* DEMAND VIEW (BUYER RFQS) */
        filteredDemands.length === 0 ? (
          <EmptyState
            title="No buyer requirements found"
            description="Currently no active procurement tenders match your selected filters."
            action="Clear Filters"
            href="/marketplace?view=demand"
            icon={Building2}
          />
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDemands.map((demand) => (
              <div 
                key={demand.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🏭</span>
                        <h3 className="text-lg font-black capitalize text-foreground">{demand.crop_id}</h3>
                        <TrustBadge type="buyer" size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{demand.location.split(",")[0]} · Processing Facility</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                      Active RFQ
                    </span>
                  </div>

                  {/* Procurement Specs Box */}
                  <div className="my-3.5 grid grid-cols-2 gap-2 bg-muted/20 border border-border/60 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Volume Needed</span>
                      <span className="font-black text-foreground text-sm">{demand.quantity_needed || (demand as any).quantity || 100} Quintals</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Target Price Ceiling</span>
                      <span className="font-black text-emerald-800 text-sm">₹{(demand.offered_price || (demand as any).target_price || 4800).toLocaleString("en-IN")}/Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Moisture Tolerance</span>
                      <span className="font-bold text-foreground">&lt; 11.5% Maximum</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Payment Terms</span>
                      <span className="font-bold text-foreground">100% Escrow on Gate In</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Buyer: <strong className="text-foreground font-semibold">{demand.buyer_name || demand.business_name || "ITC Agri Division"}</strong></span>
                    <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                      Needed within 7 days
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-8 font-bold">
                    <Link href={`/marketplace/requirements/${demand.id}`}>
                      View Full Specifications
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs h-8 font-bold shadow-xs">
                    <Link href={`/messages?recipientId=demo-buyer&submitBid=true&demandId=${demand.id}`}>
                      Submit Farm Proposal
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
            <table className="w-full min-w-[50rem] text-left text-xs">
              <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Crop & RFQ</th>
                  <th className="px-4 py-3 text-right">Required Volume</th>
                  <th className="px-4 py-3">Quality Threshold</th>
                  <th className="px-4 py-3 text-right">Target Buying Rate</th>
                  <th className="px-4 py-3">Delivery Facility</th>
                  <th className="px-4 py-3 text-center">Settlement Guarantee</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDemands.map((demand) => (
                  <tr key={demand.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-foreground capitalize block">{demand.crop_id}</span>
                      <span className="text-[10px] text-muted-foreground">#{demand.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-foreground">
                      {demand.quantity_needed || (demand as any).quantity || 100} Quintals
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      Grade A · Moisture &lt; 11.5%
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-800 text-sm">
                      ₹{(demand.offered_price || (demand as any).target_price || 4800).toLocaleString("en-IN")}/Q
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {demand.location.split(",")[0]}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Escrow Backed
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button asChild size="sm" className="text-xs h-7 font-bold">
                        <Link href={`/marketplace/requirements/${demand.id}`}>Submit Bid</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" rows={4} />}>
      <MarketplaceContent />
    </Suspense>
  );
}

