"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  ArrowRight, 
  Store, 
  MapPin, 
  Search, 
  Building2, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileText, 
  TrendingDown, 
  Award,
  Sparkles,
  Bookmark,
  MessageSquare
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getBuyerDemands, getMarketplaceListings, getAgreements, getProcurementRequirements } from "@/lib/services/domain";
import type { DemandPost, CropListing } from "@/lib/api";
import type { ExtendedTradeAgreement, ProcurementRequirement } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function BuyerHomePage() {
  const { user, loading: userLoading } = useRequiredUser(["buyer", "consumer"]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [rfqs, setRfqs] = useState<ProcurementRequirement[]>([]);
  const [supply, setSupply] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedLots, setSavedLots] = useState<string[]>([]);

  useEffect(() => {
    if (userLoading || !user) return;
    async function loadData() {
      try {
        const [demandsRes, supplyRes, agreementsRes, rfqRes] = await Promise.all([
          getBuyerDemands(),
          getMarketplaceListings(),
          getAgreements(),
          getProcurementRequirements()
        ]);
        setDemands(demandsRes.data || []);
        setSupply(supplyRes.data || []);
        setAgreements(agreementsRes.data || []);
        setRfqs(rfqRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);

  if (userLoading || loading) return <LoadingSkeleton />;

  const toggleSave = (id: string) => {
    setSavedLots(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const primaryRequirement = rfqs[0] || {
    id: "rfq-001",
    crop_id: "Soybean",
    quantity: 100,
    quality: "Grade A (Moisture < 11%)",
    deadline: "25 Sep 2026",
    destination: "Dewas Agro Mill Gate",
    matchedSuppliers: [{ id: "1" }, { id: "2" }]
  };

  const inTransitDeals = agreements.filter(a => a.status === "in_transit" || a.status === "pickup_scheduled");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 theme-buyer">
      
      {/* 1. HERO SOURCING COMMAND CENTER (Section 14) */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Institutional Procurement Terminal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif text-foreground tracking-tight">
              Good morning, {user?.name || "Corporate Buyer"}.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              What agricultural supply are you looking to procure today? Broadcast instant RFQs or source directly from certified farm-gate lots.
            </p>
          </div>

          {/* Large Primary CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Button asChild size="lg" className="font-bold text-sm h-12 px-6 shadow-md">
              <Link href="/buyer/requirements/new" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>+ POST REQUIREMENT</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="font-semibold text-xs h-9">
              <Link href="/marketplace?view=supply">
                Browse Live Harvest Supply →
              </Link>
            </Button>
          </div>
        </div>

        {/* ACTIVE PROCUREMENT STRIP (Section 14) */}
        <div className="mt-6 pt-6 border-t border-border/70">
          <div className="rounded-xl bg-card border border-primary/25 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold shrink-0">
                🌱
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Active High-Priority RFQ
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    Needed by {primaryRequirement.deadline || "25 Sep"}
                  </span>
                </div>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  {primaryRequirement.crop_id || "Soybean"} · {primaryRequirement.quantity || 100} Quintals
                </h3>
                <p className="text-xs text-muted-foreground">
                  Specs: {primaryRequirement.quality || "Grade A (Moisture < 11%)"} · Destination: {primaryRequirement.destination || "Dewas Industrial Gate"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div className="text-right hidden sm:block">
                <span className="text-base font-black text-emerald-800 block">12 Matched Suppliers</span>
                <span className="text-[11px] text-muted-foreground">NABL assays verified</span>
              </div>
              <Button asChild size="sm" className="font-bold text-xs shadow-xs h-9">
                <Link href={`/buyer/requirements/${primaryRequirement.id || "rfq-001"}`}>
                  View Matches
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROCUREMENT OVERVIEW VISUAL PIPELINE (Section 15) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Procurement Overview & Pipeline
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link 
            href="/buyer/requirements" 
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all group shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Requirements</span>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums group-hover:text-primary transition-colors">
              {rfqs.length || 3}
            </p>
            <span className="text-[11px] text-primary font-bold mt-0.5 block">Broadcasted RFQs</span>
          </Link>

          <Link 
            href="/marketplace" 
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all group shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Matched Suppliers</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1 tabular-nums">
              24
            </p>
            <span className="text-[11px] text-muted-foreground font-semibold mt-0.5 block">Qualified growers</span>
          </Link>

          <Link 
            href="/deals" 
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all group shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Offers Received</span>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums group-hover:text-primary transition-colors">
              7
            </p>
            <span className="text-[11px] text-amber-800 font-bold mt-0.5 block">Awaiting decision</span>
          </Link>

          <Link 
            href="/deals" 
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all group shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Deals in Progress</span>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums group-hover:text-primary transition-colors">
              {agreements.length || 2}
            </p>
            <span className="text-[11px] text-emerald-800 font-bold mt-0.5 block">Escrow locked</span>
          </Link>

          <Link 
            href="/deals" 
            className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all group shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Upcoming Deliveries</span>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums group-hover:text-primary transition-colors">
              {inTransitDeals.length || 1}
            </p>
            <span className="text-[11px] text-primary font-bold mt-0.5 block">Gate arrivals today</span>
          </Link>
        </div>
      </div>

      {/* 3. SUPPLY NEAR YOU / SUPPLY DISCOVERY (Section 16) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Certified Farm-Gate Supply Near You
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct lots from verified producers and FPOs within 50 km radius with certified moisture assays
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs font-bold h-8">
              <Link href="/marketplace?view=supply">
                Filter All Lots ({supply.length})
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {supply.slice(0, 6).map((lot) => {
            const isSaved = savedLots.includes(lot.id);
            return (
              <div 
                key={lot.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top lot identity */}
                  <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">🌾</span>
                        <h3 className="text-lg font-black capitalize text-foreground">{lot.crop_id}</h3>
                        <TrustBadge type="producer" size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span>{lot.location.split(",")[0]} · 14 km away</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSave(lot.id)}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                      title={isSaved ? "Saved" : "Save Lot"}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>

                  {/* Agricultural Specs Table */}
                  <div className="my-3 grid grid-cols-2 gap-2 bg-muted/20 border border-border/60 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Available Volume</span>
                      <span className="font-black text-foreground text-sm">{lot.quantity} Quintals</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Farm Gate Ask</span>
                      <span className="font-black text-primary text-sm">₹{lot.expected_price.toLocaleString("en-IN")}/Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Assay Quality</span>
                      <span className="font-bold text-foreground">{lot.quality_grade || "Grade A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Moisture Assay</span>
                      <span className="font-bold text-foreground">{lot.moisture_percent || 10.8}%</span>
                    </div>
                  </div>

                  {/* Seller & Verification Details */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground truncate">
                      Ramesh Patel (FPO Member)
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                      98% Reliability
                    </span>
                  </div>
                </div>

                {/* Actions (Section 16: Compare, Save, Contact, Make Offer) */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-8 font-bold">
                    <Link href={`/messages?recipientId=demo-farmer&crop=${lot.crop_id}`}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Contact
                    </Link>
                  </Button>
                  
                  <div className="flex items-center gap-1.5">
                    <Button asChild variant="outline" size="sm" className="text-xs h-8 font-bold">
                      <Link href={`/marketplace/listings/${lot.id}`}>
                        Compare
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="text-xs h-8 font-bold shadow-xs">
                      <Link href={`/messages?recipientId=demo-farmer&makeOffer=true&crop=${lot.crop_id}&lotId=${lot.id}`}>
                        Make Offer
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. UPCOMING INBOUND LOGISTICS & TRANSIT */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h2 className="text-base font-black text-foreground">
              Inbound Consignments & Plant Gate Schedule
            </h2>
          </div>
          <Link href="/deals" className="text-xs font-bold text-primary hover:underline">
            View Logistics Ledger
          </Link>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-muted/20 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 font-bold shrink-0">
                🚚
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Consignment #CON-8812</span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    In Transit · ETA 2h
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  100Q Grade A Soybean from Sanwer Farm Gate · Allocated to Weighbridge Gate Bay #3
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Vehicle Registration</span>
                <span className="font-mono font-bold text-foreground">MP-09-GH-8214</span>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs font-bold h-8">
                <Link href="/deals/deal-001">Track Consignment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

