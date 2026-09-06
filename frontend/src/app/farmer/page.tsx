"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  ShieldCheck,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck,
  CheckCircle2,
  CalendarDays,
  Building2,
  Scale,
  Award,
  BarChart3,
  UsersRound,
  Layers,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { CropListing, DemandPost, PriceTrendResponse, BuyerMatchOpportunity } from "@/lib/api";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  getFarmerListings,
  getDemandPosts,
  getAgreements,
  getNetworkPosts,
  getMarketTrend,
  getBuyerMatches,
  type DataSource,
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement, NetworkPost } from "@/lib/data/demo";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";
import CropLotCard from "@/components/CropLotCard";
import { Button } from "@/components/ui/button";

export default function FarmerHomePage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [matches, setMatches] = useState<BuyerMatchOpportunity[]>([]);
  const [soybeanTrend, setSoybeanTrend] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [listingsRes, demandsRes, agreementsRes, trendRes] = await Promise.all([
        getFarmerListings(),
        getDemandPosts("soybean"),
        getAgreements(),
        getMarketTrend("soybean", "30d"),
      ]);
      setListings(listingsRes.data);
      setDemands(demandsRes.data.slice(0, 3));
      setAgreements(agreementsRes.data);
      setSoybeanTrend(trendRes.data);
      setSource(listingsRes.source === "demo" ? "demo" : "api");

      // Load matching buyers for primary lot if available
      if (listingsRes.data.length > 0) {
        const matchesRes = await getBuyerMatches(listingsRes.data[0].id);
        setMatches(matchesRes.data.slice(0, 3));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not fetch farmer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadData();
  }, [hasAccess, user]);

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const primaryLot = listings[0];
  const activeAgreements = agreements.filter((a) => a.status !== "completed");
  const totalPotentialValue = listings.reduce((sum, l) => sum + l.quantity * l.expected_price, 0);
  const totalMatchedBuyers = matches.length > 0 ? matches.length : 3;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* 00 — GREETING & CONTEXTUAL ACTION HEADER */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                Farmer Command Center
              </span>
              <TrustBadge type="producer" size="sm" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Good morning, {user.name} 👋
            </h1>

            {/* Contextual Highlights answering "What's the status right now?" */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
              {primaryLot && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Your {primaryLot.commodity} lot has {totalMatchedBuyers} matching buyers
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-foreground font-bold border border-border">
                ₹{totalPotentialValue.toLocaleString("en-IN")} potential value available
              </span>
              {activeAgreements.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  {activeAgreements.length} active deal needs your attention
                </span>
              )}
            </div>
          </div>

          {/* Large Action Trigger */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button size="lg" className="font-bold px-6 h-12 shadow-sm" asChild>
              <Link href="/farmer/produce/new">
                <Plus className="h-4 w-4 mr-2" />
                List New Produce
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-bold px-5 h-12" asChild>
              <Link href="/farmer/buyers">
                Find Buyers
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Farmer Command Center is running in offline demo mode with authentic Central India crop lots and mandi data.
        </DemoNotice>
      )}

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadData} />}

      {/* 01 — ACTION REQUIRED (Dominant, Attention-first cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            01 — Action Required
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">Priority items requiring your response</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action Card 1: Buyer waiting for response */}
          <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Offer Received
              </span>
              <span className="text-muted-foreground text-[11px] font-semibold">2 hours ago</span>
            </div>
            <div>
              <h3 className="font-black text-foreground text-base">Agrocorp Central Processing</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Counter-bid of <strong>₹5,350/q</strong> for 200Q Soybean lot with farm-gate pickup.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Net: ₹10,46,600</span>
              <Button size="sm" className="font-bold h-8 text-xs" asChild>
                <Link href="/messages?conversation=demo-conversation-agrocorp">
                  Respond Now
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Action Card 2: Pickup scheduled */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Pickup Scheduled Tomorrow
              </span>
              <span className="text-muted-foreground text-[11px] font-semibold">09:00 AM</span>
            </div>
            <div>
              <h3 className="font-black text-foreground text-base">Malwa Freight Logistics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Truck MP-09-GH-4921 assigned for Order #deal-001 dispatch. Have weighbridge tare ready.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">Driver: Ramesh Yadav</span>
              <Button size="sm" variant="outline" className="font-bold h-8 text-xs" asChild>
                <Link href="/orders/deal-001">
                  View Slip
                </Link>
              </Button>
            </div>
          </div>

          {/* Action Card 3: Mandi price window */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Optimal Sell Window
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">+2.4% this week</span>
            </div>
            <div>
              <h3 className="font-black text-foreground text-base">Soybean Mandi Benchmark High</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current rates in Indore & Dewas are ₹5,420/q. Oil mills are restocking inventories.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">Advisory: Sell now</span>
              <Button size="sm" variant="outline" className="font-bold h-8 text-xs" asChild>
                <Link href="/farmer/market">
                  Inspect Advisory
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — YOUR ACTIVE PRODUCE (Real agricultural lots, not a database row) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              02 — Your Active Produce Lots
            </h2>
            <p className="text-xs text-muted-foreground">
              Real harvested lots available for direct sale, verified assays, and buyer discovery.
            </p>
          </div>
          <Link
            href="/farmer/produce"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Manage all lots ({listings.length}) →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((lot) => (
              <CropLotCard
                key={lot.id}
                listing={lot}
                buyerMatchCount={lot.commodity === "soybean" ? 3 : 1}
                matchPercentage={lot.commodity === "soybean" ? 94 : 88}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No produce lots listed yet"
            description="Your first listing will help verified food processors and mills discover your harvest directly."
            action="List Produce Lot"
            href="/farmer/produce/new"
            icon={Sprout}
          />
        )}
      </section>

      {/* 03 — MARKET OPPORTUNITY (Contextual demand gauge & price range) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            03 — Market Opportunity
          </h2>
          <Link href="/farmer/market" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            View detailed trends →
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Demand Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Buyer Demand Level</span>
                <span className="text-emerald-700 dark:text-emerald-400">High (82%)</span>
              </div>
              {/* Visual gauge */}
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "82%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Strong buying interest from 7 crushers and mills within 180 km.
              </p>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Central MP Trading Range
              </span>
              <p className="text-2xl font-black text-foreground">
                ₹5,280 – ₹5,460 <span className="text-xs font-normal text-muted-foreground">/ quintal</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Benchmark benchmark: ₹5,420/q · +1.8% 7-day change
              </p>
            </div>

            {/* Potential Buyers Count & Action */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Active Verified Buyers
                </span>
                <p className="text-2xl font-black text-primary">
                  7 Buyers Ready
                </p>
              </div>
              <Button asChild size="sm" className="font-bold w-fit">
                <Link href="/farmer/buyers">
                  Match Your Lots
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — FARMNEX MATCHES ("Best buyers for your produce" - explains WHY it matches) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              04 — Best Buyers for Your Produce
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by net realization in your pocket after accounting for freight distance.
            </p>
          </div>
          <Link href="/farmer/buyers" className="text-xs font-bold text-primary hover:underline">
            Compare all matches →
          </Link>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.map((match, idx) => (
              <div
                key={match.match_id}
                className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-primary/40"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-foreground text-base">{match.business_name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        {match.distance_km} km away · Farm-gate pickup
                      </p>
                    </div>
                    <span className="inline-flex items-center text-xs font-black px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {idx === 0 ? "94% Match" : idx === 1 ? "89% Match" : "84% Match"}
                    </span>
                  </div>

                  {/* Why it is a match box */}
                  <div className="bg-muted/20 border border-border/60 rounded-lg p-3 space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Why it is a match
                    </p>
                    <p className="text-foreground font-semibold">
                      Needs: {match.quantity_matched}Q {primaryLot?.commodity || "produce"}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Your supply: {primaryLot?.quantity || 200}Q available
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Buyer history: Verified bank escrow, 24h release
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Net in Hand
                      </span>
                      <p className="text-xl font-black text-emerald-800 dark:text-emerald-400">
                        ₹{match.net_realization_per_quintal.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Offer Price
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        ₹{match.offered_price_per_quintal.toLocaleString("en-IN")}/q
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${match.buyer_id}`}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    Buyer Details
                  </Link>
                  <Button size="sm" asChild className="font-bold h-8 text-xs">
                    <Link href={`/farmer/buyers?listing_id=${primaryLot?.id || ""}`}>
                      View Requirement
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 bg-card text-center space-y-3">
            <Award className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-base font-bold text-foreground">No matches found for your lot</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              List your crop details or adjust asking price to connect with active procurement buyers.
            </p>
          </div>
        )}
      </section>

      {/* 05 — QUICK ACTIONS (Large, obvious touchpoints, not buried in menus) */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          05 — Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/farmer/produce/new"
            className="border border-border bg-card rounded-xl p-4 text-center space-y-2 hover:border-primary hover:shadow-xs transition-all group"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <p className="font-bold text-foreground text-xs">List Produce</p>
            <p className="text-[10px] text-muted-foreground">Post harvest lot</p>
          </Link>

          <Link
            href="/farmer/buyers"
            className="border border-border bg-card rounded-xl p-4 text-center space-y-2 hover:border-primary hover:shadow-xs transition-all group"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-bold text-foreground text-xs">Find Buyers</p>
            <p className="text-[10px] text-muted-foreground">Best net realization</p>
          </Link>

          <Link
            href="/orders"
            className="border border-border bg-card rounded-xl p-4 text-center space-y-2 hover:border-primary hover:shadow-xs transition-all group"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="h-5 w-5" />
            </div>
            <p className="font-bold text-foreground text-xs">View Orders</p>
            <p className="text-[10px] text-muted-foreground">{agreements.length} active deals</p>
          </Link>

          <Link
            href="/messages"
            className="border border-border bg-card rounded-xl p-4 text-center space-y-2 hover:border-primary hover:shadow-xs transition-all group"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="font-bold text-foreground text-xs">Messages</p>
            <p className="text-[10px] text-muted-foreground">Counter offers</p>
          </Link>

          <Link
            href="/farmer/market"
            className="border border-border bg-card rounded-xl p-4 text-center space-y-2 hover:border-primary hover:shadow-xs transition-all group"
          >
            <div className="h-10 w-10 mx-auto rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="font-bold text-foreground text-xs">Market Prices</p>
            <p className="text-[10px] text-muted-foreground">Mandi trends</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
