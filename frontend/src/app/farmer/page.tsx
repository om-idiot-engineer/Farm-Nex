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
} from "lucide-react";
import type { CropListing, DemandPost, PriceTrendResponse } from "@/lib/api";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  getFarmerListings,
  getDemandPosts,
  getAgreements,
  getNetworkPosts,
  getMarketTrend,
  type DataSource,
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement, NetworkPost } from "@/lib/data/demo";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export default function FarmerHomePage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [soybeanTrend, setSoybeanTrend] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [listingsRes, demandsRes, agreementsRes, postsRes, trendRes] = await Promise.all([
        getFarmerListings(),
        getDemandPosts("soybean"),
        getAgreements(),
        getNetworkPosts(),
        getMarketTrend("soybean", "30d"),
      ]);
      setListings(listingsRes.data);
      setDemands(demandsRes.data.slice(0, 3));
      setAgreements(agreementsRes.data);
      setPosts(postsRes.data.slice(0, 2));
      setSoybeanTrend(trendRes.data);
      setSource(listingsRes.source === "demo" ? "demo" : "api");
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* TOP SECTION: Greeting, Location, FPO, Verification & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            Good morning, {user.name} 👋
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Sell smarter. Reach the right buyers.
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {user.farmer_profile?.location || "Sanwer, Indore, Madhya Pradesh"}
            </span>

            {user.farmer_profile?.fpo_name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-primary/25 bg-primary/5 text-primary font-semibold">
                <Building2 className="h-3.5 w-3.5" />
                {user.farmer_profile.fpo_name}
              </span>
            )}

            <TrustBadge type="producer" />
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Button size="lg" className="font-bold px-7 h-12 shadow-md" asChild>
            <Link href="/farmer/produce/new">
              <Plus className="h-4 w-4 mr-2" />
              Sell Produce
            </Link>
          </Button>
        </div>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Farmer dashboard opportunity calculations and buyer matches are demonstrated using the local browser dataset.
        </DemoNotice>
      )}

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadData} />}

      {/* TODAY'S OPPORTUNITY FLAGSHIP HERO CARD */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            Today&apos;s Opportunity
          </h2>
          {primaryLot && (
            <Link
              href="/farmer/produce"
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Manage all {listings.length} lots →
            </Link>
          )}
        </div>

        {primaryLot ? (
          <div className="border-2 border-primary/40 rounded-xl bg-card shadow-md overflow-hidden">
            <div className="bg-primary text-primary-foreground px-5 py-2 text-xs font-bold flex items-center justify-between">
              <span>ACTIVE HARVEST READY FOR CONTRACT</span>
              <span className="uppercase tracking-wider">Lot #{primaryLot.id.slice(0, 10)}</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded border bg-amber-50 text-amber-900 border-amber-200">
                      {primaryLot.commodity}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {primaryLot.quality_grade} · {primaryLot.moisture_percent || 11.2}% Moisture
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-2">
                    {primaryLot.quantity} Quintals available
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Farm-gate pickup in {primaryLot.location}
                  </p>
                </div>

                {/* Realization Highlight Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Market Benchmark
                    </span>
                    <p className="text-xl font-black text-foreground mt-0.5">₹5,420<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                    <span className="text-[10px] text-emerald-700 font-semibold">+1.8% 7-day</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      Best Estimated Net
                    </span>
                    <p className="text-xl font-black text-emerald-800 mt-0.5">₹5,233<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                    <span className="text-[10px] text-muted-foreground">After all freight</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-primary/20 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      Potential Net Realization
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-primary mt-0.5">
                      ₹13,08,250
                    </p>
                    <span className="text-[10px] text-muted-foreground">3 nearby buyers matching</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Top buyer: <strong>Agrocorp Central Processing</strong> (38 km away, pickup provided)
                </span>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/farmer/produce/new?edit=${primaryLot.id}`}>Update listing</Link>
                  </Button>
                  <Button size="sm" className="font-bold px-5" asChild>
                    <Link href={`/farmer/buyers?listing_id=${primaryLot.id}`}>
                      Compare Buyers
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 bg-card text-center space-y-3">
            <Sprout className="h-10 w-10 text-primary mx-auto" />
            <h3 className="text-lg font-black text-foreground">You don&apos;t have any active produce lots yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              List your harvested soybean, wheat, or cotton to view best net realization calculations and connect with verified buyers.
            </p>
            <Button asChild className="font-bold">
              <Link href="/farmer/produce/new">
                <Plus className="h-4 w-4 mr-1.5" />
                List Your First Lot
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* MANDI BENCHMARK TICKER STRIP */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-black uppercase tracking-wider text-[11px] text-foreground">
            Mandi Benchmarks:
          </span>
          <span className="text-muted-foreground text-[11px] hidden sm:inline">
            Official Agmarknet Central MP rates
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-foreground">Soybean:</span>
            <span className="font-black text-foreground">₹5,420/q</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded">+1.8%</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-foreground">Wheat:</span>
            <span className="font-black text-foreground">₹2,385/q</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded">+0.4%</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-foreground">Cotton:</span>
            <span className="font-black text-foreground">₹7,160/q</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1 rounded">-0.6%</span>
          </div>
        </div>

        <Link
          href="/farmer/market"
          className="text-xs font-bold text-primary hover:underline whitespace-nowrap flex items-center gap-1 shrink-0"
        >
          Should I sell or hold? →
        </Link>
      </div>

      {/* 2-COLUMN OPERATIONAL HUB: Active Deals & Buyer Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 6 COLS: Active Deals & Consignments */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Active Deals & Consignments</h3>
              <p className="text-xs text-muted-foreground">Transactions currently in contracting, transit, or escrow settlement.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-primary">
              <Link href="/orders">All Deals ({agreements.length}) →</Link>
            </Button>
          </div>

          {activeAgreements.length ? (
            <div className="space-y-3">
              {activeAgreements.map((deal) => (
                <div
                  key={deal.id}
                  className="border border-border bg-card rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-primary/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">
                        {deal.quantity}Q {deal.commodity}
                      </span>
                      <StatusBadge status={deal.status} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buyer: <strong className="text-foreground">{deal.buyer_name}</strong> · Rate: ₹{deal.price_per_quintal.toLocaleString("en-IN")}/q
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3 w-3 text-primary" />
                      {deal.transporterName || "Malwa Freight Logistics"} · Pickup {deal.delivery_date}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div>
                      <span className="text-sm font-black text-emerald-800">
                        ₹{deal.earnings_breakdown.net_farmer_earnings.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Net Farmer Payout</span>
                    </div>
                    <Button size="sm" variant="outline" asChild className="text-xs h-8 font-bold">
                      <Link href={`/orders/${deal.id}`}>
                        Track Deal
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border bg-card rounded-xl p-6 text-center text-xs text-muted-foreground space-y-2">
              <p>No active consignments currently in transit.</p>
              <Button size="sm" variant="outline" asChild className="text-xs font-bold">
                <Link href="/farmer/buyers">Find Matching Buyers</Link>
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT 6 COLS: Buyer Requests Near You */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Immediate Buyer Demand</h3>
              <p className="text-xs text-muted-foreground">Verified mills and processors seeking lots in your district.</p>
            </div>
            <Link href="/marketplace" className="text-xs font-bold text-primary hover:underline">
              Explore Marketplace →
            </Link>
          </div>

          <div className="space-y-3">
            {demands.map((demand) => (
              <div
                key={demand.id}
                className="border border-border bg-card rounded-xl p-4 shadow-xs space-y-2.5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-foreground">{demand.business_name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary" />
                      {demand.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">₹{demand.offered_price.toLocaleString("en-IN")}/q</p>
                    <span className="text-[10px] text-muted-foreground font-semibold">Offer Rate</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="text-muted-foreground">
                    Needs: <strong>{demand.quantity_needed}Q {demand.commodity}</strong> ({demand.quality_grade})
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs font-bold" asChild>
                    <Link href={`/marketplace/requirements/${demand.id}`}>Inspect RFQ</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
