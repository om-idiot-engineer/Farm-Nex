"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal, 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Send,
  Building2,
  Calendar
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getMarketListings, getFpoSupply } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";

export default function BuyerDiscoverPage() {
  const { user, loading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const listingsResult = getMarketListings();
  const fpoSupplyResult = getFpoSupply();

  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [maxDistance, setMaxDistance] = useState("150");
  const [sourceType, setSourceType] = useState<"all" | "farmer" | "fpo">("all");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="card" />;
  }

  const listings = listingsResult.data;
  const fpoLots = fpoSupplyResult.data;

  // Destination from buyer profile
  const buyerDestination = user.buyer_profile?.location || "Dewas Plant (MP)";

  // Filter listings
  const filteredListings = listings.filter((l: any) => {
    const matchesSearch = l.commodity.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = selectedCrop === "all" || l.commodity.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesSource = sourceType === "all" || sourceType === "farmer";
    return matchesSearch && matchesCrop && matchesSource;
  });

  const filteredFpo = fpoLots.filter((f) => {
    const matchesSearch = f.crop.toLowerCase().includes(search.toLowerCase()) ||
      f.collectionCenter.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = selectedCrop === "all" || f.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesSource = sourceType === "all" || sourceType === "fpo";
    return matchesSearch && matchesCrop && matchesSource;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/buyer" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyer Center
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Direct Supply Sourcing Discovery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore verified farm-gate produce lots and FPO aggregated truckloads with estimated delivered freight landed cost to {buyerDestination}.
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/buyer/procurement">
            Manage Sourcing RFQs
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Delivered cost calculations factor in freight at ₹3.2/ton/km from origin to your specified processing facility.
      </DemoNotice>

      {/* Filter and Search Bar */}
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search crop or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Crops</option>
            <option value="Soybean">Soybean</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
            <option value="Chana">Chana</option>
          </select>
        </div>

        <div>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as any)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Suppliers (Farmers & FPOs)</option>
            <option value="fpo">FPO Pooled Lots (Truckload scale)</option>
            <option value="farmer">Direct Individual Farmers</option>
          </select>
        </div>

        <div>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="50">Within 50 km</option>
            <option value="150">Within 150 km</option>
            <option value="300">Within 300 km</option>
            <option value="all">Any Distance</option>
          </select>
        </div>
      </div>

      {/* Sourcing Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Available Produce Lots ({filteredListings.length + filteredFpo.length} Found)
          </h2>
          <span className="text-xs text-muted-foreground">
            Destination: <strong className="text-foreground">{buyerDestination}</strong>
          </span>
        </div>

        {/* FPO Batches First (High Volume) */}
        {filteredFpo.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              FPO Aggregated Lots (Bulk / Truckload Scale)
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFpo.map((fpo) => {
                const estFreight = 65; // ₹65/Q estimated freight
                const basePrice = fpo.targetPrice || 5300;
                const landedCost = basePrice + estFreight;

                return (
                  <div key={fpo.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            FPO Aggregated
                          </span>
                          <TrustBadge type="fpo" size="sm" />
                        </div>
                        <h3 className="text-lg font-black text-foreground mt-1">
                          {fpo.quantity} Quintals {fpo.crop}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {fpo.quality} · Moisture: <strong className="text-foreground">{fpo.moisture}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Est. Landed Cost</span>
                        <p className="text-xl font-black text-primary">₹{landedCost.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                        <p className="text-[10px] text-muted-foreground">Incl. ₹{estFreight} freight</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {fpo.collectionCenter}
                      </span>
                      <span>•</span>
                      <span>{fpo.members} Member Farmers</span>
                      <span>•</span>
                      <span>Available: {fpo.availableDate}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                        <Link href={`/profile/demo-fpo`}>
                          View FPO Profile
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground text-xs">
                        <Link href={`/messages?recipientId=demo-fpo&subject=RFQ for FPO Lot ${fpo.id}`}>
                          Send Purchase Offer
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Farmer Lots */}
        {filteredListings.length > 0 && (
          <div className="space-y-3 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Direct Farmer Gate Lots
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredListings.map((lot: any) => {
                const estFreight = 85;
                const landedCost = lot.expected_price + estFreight;

                return (
                  <div key={lot.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Direct Farmer
                          </span>
                          <TrustBadge type="producer" size="sm" />
                        </div>
                        <h3 className="text-lg font-black text-foreground mt-1">
                          {lot.quantity} Quintals {lot.commodity}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {lot.quality_grade} · Moisture: <strong className="text-foreground">{lot.moisture_percentage || "11.2"}%</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Est. Landed Cost</span>
                        <p className="text-xl font-black text-foreground">₹{landedCost.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                        <p className="text-[10px] text-muted-foreground">Gate: ₹{lot.expected_price}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {lot.location}
                      </span>
                      <span>•</span>
                      <span>Farmer: <strong>{lot.farmer_name || "Verified Producer"}</strong></span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                        <Link href={`/marketplace/listings/${lot.id}`}>
                          Lot Quality Details
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground text-xs">
                        <Link href={`/messages?recipientId=${lot.user_id}&subject=Procurement Offer for ${lot.commodity}`}>
                          Inquire / Offer
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
