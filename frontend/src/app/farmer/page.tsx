"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  ArrowRight, 
  Sprout, 
  MapPin, 
  Handshake, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  AlertCircle, 
  Clock, 
  Check, 
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFarmerListings, getAgreements, getBuyerMatches, getNotifications } from "@/lib/services/domain";
import type { CropListing, BuyerMatchOpportunity } from "@/lib/api";
import type { ExtendedTradeAgreement, AppNotification } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function FarmerHomePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useRequiredUser(["farmer", "fpo"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [matches, setMatches] = useState<BuyerMatchOpportunity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    async function loadData() {
      try {
        const [listingsRes, agreementsRes, notifRes] = await Promise.all([
          getFarmerListings(),
          getAgreements(),
          getNotifications()
        ]);
        const lots = listingsRes.data || [];
        setListings(lots);
        setAgreements(agreementsRes.data || []);
        setNotifications(notifRes.data || []);

        if (lots[0]) {
          const matchRes = await getBuyerMatches(lots[0].id);
          setMatches(matchRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);

  if (userLoading || loading) return <LoadingSkeleton />;

  const firstName = user?.name ? user.name.split(" ")[0] : "Farmer";
  const primaryLot = listings[0] || {
    id: "lot-soybean-01",
    crop_id: "soybean",
    quantity: 40,
    quality_grade: "Grade A",
    expected_price: 4750,
    location: "Indore, Madhya Pradesh",
    status: "listed",
    harvest_date: "Available in 10 days"
  };

  const pendingOffers = agreements.filter(a => 
    (a.status as string) === "matched" || 
    (a.status as string) === "in_negotiation" || 
    (a.status as string) === "trade_confirmed"
  );

  // Indicative market math
  const minPrice = 4650;
  const maxPrice = 4850;
  const farmerPrice = primaryLot.expected_price || 4750;
  const rangePercent = Math.min(100, Math.max(0, ((farmerPrice - minPrice) / (maxPrice - minPrice)) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* 1. HERO COMMAND CENTER (Section 7) */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-secondary/30 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Indore District Ag-Hub · Live Mandi Session</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif text-foreground tracking-tight">
              Good morning, {firstName}.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Here’s what’s happening around your farm today. You have active buyer bids ready for immediate negotiation.
            </p>
          </div>

          {/* YOUR FARM TODAY Command Strip */}
          <div className="bg-card border border-primary/25 rounded-xl p-5 shadow-sm lg:min-w-[320px] flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  YOUR FARM TODAY
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <h3 className="text-lg font-black capitalize text-foreground leading-none">
                      {primaryLot.crop_id}
                    </h3>
                    <span className="text-xs font-bold text-primary mt-0.5 block">
                      {primaryLot.quantity} Quintals available
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase">
                Harvest Ready
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/80 pt-3">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {primaryLot.location.split(",")[0]}
              </span>
              <span className="font-semibold text-foreground">
                Ready in 10 days
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="w-full font-bold shadow-xs text-xs h-9">
                <Link href="/marketplace?crop=soybean">
                  Find Buyers
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-bold text-xs h-9 shrink-0">
                <Link href="/farmer/produce/new">
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPACT VISUAL STATS STRIP (Section 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link 
          href="/farmer/produce"
          className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
            <span className="text-[11px] font-black uppercase tracking-wider">Active Produce</span>
            <Sprout className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {listings.length || 3}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Lots Listed</span>
          </div>
        </Link>

        <Link 
          href="#opportunities"
          className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
            <span className="text-[11px] font-black uppercase tracking-wider">Buyer Matches</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {matches.length || 12}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">High Affinity</span>
          </div>
        </Link>

        <Link 
          href="/deals"
          className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
            <span className="text-[11px] font-black uppercase tracking-wider">Active Deals</span>
            <Handshake className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {agreements.length || 2}
            </span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">In Escrow</span>
          </div>
        </Link>

        <Link 
          href="#action-center"
          className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-muted-foreground group-hover:text-amber-700 transition-colors">
            <span className="text-[11px] font-black uppercase tracking-wider">Pending Actions</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums">
              {pendingOffers.length || 1}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">Awaiting You</span>
          </div>
        </Link>
      </div>

      {/* 3. MARKET PULSE & ACTION CENTER (Split Layout - Sections 9 & 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* MARKET PULSE (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-base font-black uppercase tracking-wider text-foreground">
                  Market Pulse · Soybean
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Benchmark rate spread for Malwa Mandi Hub (Indore, Dewas, Ujjain)
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-muted/60 text-muted-foreground border border-border self-start sm:self-auto">
              Indicative Mandi Intelligence
            </span>
          </div>

          {/* Price Range Visualizer */}
          <div className="space-y-3 bg-muted/20 border border-border/60 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Mandi Low: ₹{minPrice.toLocaleString("en-IN")}</span>
              <span className="text-primary font-black text-sm">Your Asking Price: ₹{farmerPrice.toLocaleString("en-IN")}/Q</span>
              <span>Mandi High: ₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>

            {/* Slider track with position marker */}
            <div className="relative w-full h-3 bg-muted rounded-full overflow-visible my-4">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-primary to-emerald-500 rounded-full w-full opacity-80" />
              {/* Target Marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${rangePercent}%` }}
              >
                <div className="h-5 w-5 rounded-full border-3 border-card bg-foreground shadow-md ring-2 ring-primary/40" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center font-medium">
              Your price of ₹{farmerPrice.toLocaleString("en-IN")} sits at the <strong className="text-foreground">top 60th percentile</strong> of verified processor bids this week.
            </p>
          </div>

          {/* Demand & Nearby Buyers Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-muted-foreground uppercase text-[10px]">Regional Demand Pressure</span>
                <span className="text-emerald-700 font-black">High · 88%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Food processors actively procuring for next 14 days.
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-muted-foreground uppercase text-[10px]">Nearby Verified Buyers</span>
                <span className="text-primary font-black">4 Active Entities</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {["ITC", "Adani Wilmar", "Agrocorp", "Malwa Oils"].map((b, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-bold text-foreground">
                    {b}
                  </span>
                ))}
              </div>
              <Link href="/marketplace?crop=soybean" className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1 pt-1">
                Explore buyer bids <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ACTION CENTER (Section 13) */}
        <div id="action-center" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border/80 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
              Priorities
            </span>
            <h2 className="text-base font-black text-foreground">
              You May Want to Act On
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {pendingOffers.length > 0 ? (
              pendingOffers.map((deal) => (
                <div key={deal.id} className="p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span className="flex items-center gap-1">
                      <Handshake className="h-3.5 w-3.5 text-amber-700" />
                      Offer Awaiting Response
                    </span>
                    <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">Action Req</span>
                  </div>
                  <p className="text-foreground font-semibold">
                    {deal.buyer_name} proposed ₹{deal.price_per_quintal || 4800}/Q for {deal.quantity || 60}Q.
                  </p>
                  <Button asChild size="sm" className="w-full h-8 text-xs font-bold shadow-xs">
                    <Link href={`/deals/${deal.id}`}>Review Commercial Offer</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>All Active Offers Handled</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  No pending buyer proposals require your signature right now.
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">Buyer Matches Ready</span>
                <span className="text-primary font-black">{matches.length || 3} New</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                High-fit requirements matching your harvest moisture specifications.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs font-bold">
                <a href="#opportunities">Review Matched Buyers</a>
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">Farm Profile Status</span>
                <span className="text-emerald-700 font-black">85% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[85%]" />
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Add land GPS survey to unlock Institutional Fast-Pay.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. OPPORTUNITIES FOR YOU (Section 10) */}
      <section id="opportunities" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Opportunities For You
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              High-affinity procurement tenders algorithmically matched against your active harvest lots
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            Ranked by Net Realization (In-Pocket)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(matches.length > 0 ? matches : [
            {
              match_id: "m-01",
              demand_id: "dem-01",
              buyer_id: "b-01",
              business_name: "Agrocorp Central Processing",
              buyer_verified: true,
              crop_id: "soybean",
              quantity_matched: 60,
              offered_price_per_quintal: 4800,
              net_realization_per_quintal: 4683,
              distance_km: 18,
              why_this_offer: ["Quantity compatible (60 Q)", "Grade A certified match", "Delivery date match (< 7 days)"]
            },
            {
              match_id: "m-02",
              demand_id: "dem-02",
              buyer_id: "b-02",
              business_name: "ITC Agri Sourcing Division",
              buyer_verified: true,
              crop_id: "soybean",
              quantity_matched: 100,
              offered_price_per_quintal: 4850,
              net_realization_per_quintal: 4720,
              distance_km: 24,
              why_this_offer: ["Instant farm-gate pickup", "Escrow protected payout", "Moisture specification met"]
            }
          ]).map((opp, idx) => (
            <div
              key={opp.match_id || idx}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header with Match Badge */}
                <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-foreground">{opp.business_name}</h3>
                      <TrustBadge type="buyer" size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span>{opp.distance_km} km away · Farm-gate collection available</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs shrink-0 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {idx === 0 ? "96% MATCH" : "91% MATCH"}
                  </span>
                </div>

                {/* Offer Details */}
                <div className="my-4 bg-muted/20 border border-border/60 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Procurement Need
                    </span>
                    <p className="text-base font-black text-foreground capitalize">
                      {opp.quantity_matched} Q · Grade A Soybean
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                      Gross Offer Rate
                    </span>
                    <p className="text-xl font-black text-emerald-800 tabular-nums">
                      ₹{opp.offered_price_per_quintal.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground">/Q</span>
                    </p>
                  </div>
                </div>

                {/* Verification Checkmarks */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Compatibility Factors
                  </span>
                  <div className="space-y-1 pt-1">
                    {(opp.why_this_offer || [
                      "Quantity fully compatible with lot",
                      "Certified moisture assay accepted",
                      "Direct digital weighbridge verification"
                    ]).map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 text-foreground text-xs font-medium">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <Link
                  href={`/profile/${opp.buyer_id}`}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Buyer Credentials →
                </Link>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="text-xs h-8 font-bold">
                    <Link href={`/messages?recipientId=${opp.buyer_id}`}>
                      Message
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs h-8 font-bold shadow-xs">
                    <Link href={`/deals/new?matchId=${opp.match_id || "demo"}&buyerId=${opp.buyer_id}`}>
                      View Opportunity
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MY PRODUCE AGRICULTURAL INVENTORY STRIP (Section 11) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-black text-foreground tracking-tight">
                My Harvest Produce Inventory
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage lots, track moisture assay certificates, and control marketplace availability
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/farmer/produce" className="text-xs font-bold text-primary hover:underline">
              View All Lots ({listings.length})
            </Link>
            <Button asChild size="sm" className="font-bold text-xs h-8">
              <Link href="/farmer/produce/new">
                <Plus className="h-3.5 w-3.5 mr-1" /> List New Produce
              </Link>
            </Button>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
            <Sprout className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No active listings</h3>
            <p className="text-sm text-muted-foreground mb-4">List your produce to find verified buyers nearby.</p>
            <Button asChild>
              <Link href="/farmer/produce/new">List Produce</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((lot) => (
              <div
                key={lot.id}
                className="rounded-xl border border-border bg-card p-5 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        Lot #{lot.id.slice(0, 8)}
                      </span>
                      <h3 className="text-xl font-black text-foreground capitalize mt-0.5">
                        {lot.crop_id}
                      </h3>
                    </div>
                    <StatusBadge status={lot.status} size="sm" />
                  </div>

                  {/* Agricultural Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-muted/20 border border-border/60 rounded-lg p-3 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Available Qty</span>
                      <span className="font-black text-foreground text-sm">{lot.quantity} Quintals</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Asking Rate</span>
                      <span className="font-black text-primary text-sm">₹{lot.expected_price.toLocaleString("en-IN")}/Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Quality Grade</span>
                      <span className="font-bold text-foreground">{lot.quality_grade || "Grade A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Moisture Assay</span>
                      <span className="font-bold text-foreground">{lot.moisture_percent || 11.2}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {lot.location.split(",")[0]}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      4 Interested Buyers
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-8 font-bold">
                    <Link href={`/farmer/produce/new?edit=${lot.id}`}>
                      Edit Lot
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs h-8 font-bold shadow-xs">
                    <Link href={`/marketplace?crop=${lot.crop_id}`}>
                      Find Buyers
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. FARMER ACTIVITY TIMELINE (Section 12) */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-black text-foreground">
              Recent Farm Activity & Mandi Updates
            </h2>
          </div>
          <Link href="/notifications" className="text-xs font-bold text-primary hover:underline">
            View All Updates
          </Link>
        </div>

        <div className="space-y-3">
          {(notifications.length > 0 ? notifications.slice(0, 3) : [
            {
              id: "n-1",
              title: "ABC Foods submitted formal trade proposal",
              description: "Offered ₹4,800/Q for 60Q Grade A Soybean with farm-gate logistics included.",
              createdAt: new Date().toISOString(),
              href: "/deals"
            },
            {
              id: "n-2",
              title: "Soybean lot #SOY-82 received 3 new processor matches",
              description: "Buyers in Dewas industrial belt opened purchase tenders matching your moisture assay.",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              href: "/marketplace"
            },
            {
              id: "n-3",
              title: "Consignment pickup completed & verified",
              description: "Electronic weighbridge tare and gross receipt verified at plant gate.",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              href: "/deals"
            }
          ]).map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-3 text-xs p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
              <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {idx === 0 ? "Today" : idx === 1 ? "Yesterday" : "2 days ago"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

