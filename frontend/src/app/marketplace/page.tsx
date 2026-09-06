"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MapPin,
  PackageSearch,
  Plus,
  Scale,
  ShieldCheck,
  Sprout,
  Filter,
  SlidersHorizontal,
  Search,
  Handshake,
  Truck,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { CropListing, DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import {
  getDemandPosts,
  getMarketplaceListings,
  getAgreements,
  type DataSource,
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import CropLotCard from "@/components/CropLotCard";
import BuyerRequirementCard from "@/components/BuyerRequirementCard";
import StatusBadge from "@/components/StatusBadge";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

type MarketplaceView = "buy" | "sell" | "requirements" | "deals";

export default function MarketplacePage() {
  const { user } = useUser();
  const [view, setView] = useState<MarketplaceView>("buy");
  const [commodity, setCommodity] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMarketplace = async () => {
    setLoading(true);
    setError("");
    try {
      const selectedCommodity = commodity === "all" ? undefined : commodity;
      const [supplyResult, demandResult, agreementsResult] = await Promise.all([
        getMarketplaceListings(selectedCommodity),
        getDemandPosts(selectedCommodity),
        getAgreements(),
      ]);
      setListings(supplyResult.data);
      setDemands(demandResult.data);
      setAgreements(agreementsResult.data);
      setSource(supplyResult.source === "demo" || demandResult.source === "demo" ? "demo" : "api");
    } catch (err: any) {
      setError(err.message || "We could not load marketplace records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, [commodity]);

  const filteredListings = listings.filter((l) => {
    if (gradeFilter !== "all" && l.quality_grade !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.commodity.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        (l.farmer_name && l.farmer_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredDemands = demands.filter((d) => {
    if (gradeFilter !== "all" && d.quality_grade !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.commodity.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        (d.business_name && d.business_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const actionHref =
    user?.role === "buyer"
      ? "/buyer/procurement"
      : user?.role === "farmer"
      ? "/farmer/produce/new"
      : user?.role === "fpo"
      ? "/fpo/supply"
      : "/";
  const actionLabel =
    user?.role === "buyer"
      ? "+ Publish RFQ"
      : user?.role === "farmer"
      ? "+ List Produce"
      : user?.role === "fpo"
      ? "+ Pool Supply"
      : "Sign In to Trade";

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Sprout className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Unified Agricultural Commerce Exchange
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Agricultural Marketplace</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover verified supply, broadcast procurement requirements, and trade with transparent net realization.
          </p>
        </div>

        <Button asChild className="font-bold shrink-0 shadow-sm">
          <Link href={actionHref}>
            {actionLabel}
          </Link>
        </Button>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Marketplace exchange lots and buyer demands are authenticated development records for Central India mandis.
        </DemoNotice>
      )}

      {error && <ErrorState message={error} onRetry={loadMarketplace} />}

      {/* TOP-LEVEL TABS (Section 9: BUY, SELL, REQUIREMENTS, DEALS) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-border pb-4">
        {/* 4 Mental Model Tabs */}
        <div className="inline-flex rounded-xl border border-border bg-card p-1 shrink-0">
          <button
            type="button"
            onClick={() => setView("buy")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              view === "buy"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            BUY (Find Produce)
          </button>
          <button
            type="button"
            onClick={() => setView("sell")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              view === "sell"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            SELL (Find Buyers)
          </button>
          <button
            type="button"
            onClick={() => setView("requirements")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              view === "requirements"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            REQUIREMENTS (RFQs)
          </button>
          <button
            type="button"
            onClick={() => setView("deals")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              view === "deals"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            DEALS (Trades)
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, town, producer..."
              className="pl-8 pr-3 py-1.5 text-xs border border-input rounded-md bg-card outline-none focus:border-primary w-full"
            />
          </div>

          {/* Commodity chips */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "all", label: "All Crops" },
              { id: "soybean", label: "Soybean" },
              { id: "wheat", label: "Wheat" },
              { id: "cotton", label: "Cotton" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCommodity(c.id)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                  commodity === c.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-input rounded-md bg-card outline-none font-medium"
          >
            <option value="all">All Grades</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
          </select>
        </div>
      </div>

      {/* Content Display based on View Tab */}
      {loading ? (
        <LoadingSkeleton variant="card" rows={6} />
      ) : view === "buy" ? (
        filteredListings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing <strong>{filteredListings.length}</strong> available lots for direct purchase</span>
              <span>All prices listed as farm-gate asking rates</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <CropLotCard
                  key={listing.id}
                  listing={listing}
                  buyerMatchCount={listing.commodity === "soybean" ? 3 : 1}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No produce lots match your filters"
            description="Try changing crop or grade filters, or list your own lot to reach active buyers."
            action="List Produce Lot"
            href={actionHref}
            icon={PackageSearch}
          />
        )
      ) : view === "sell" || view === "requirements" ? (
        filteredDemands.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing <strong>{filteredDemands.length}</strong> active buyer demands & tenders</span>
              <span>Broadcasted by certified processing mills & institutional buyers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDemands.map((demand) => (
                <BuyerRequirementCard key={demand.id} demand={demand} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No buyer requirements found"
            description="Try broadening your crop selection or post a new procurement tender."
            action="Post Procurement Demand"
            href="/buyer/procurement"
            icon={Building2}
          />
        )
      ) : (
        /* DEALS VIEW TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing <strong>{agreements.length}</strong> active trading contracts & escrow settlements</span>
            <span>100% digitally secured with weighbridge telemetry</span>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
            {agreements.map((deal) => (
              <div key={deal.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-foreground">
                      {deal.quantity}Q {deal.commodity}
                    </span>
                    <StatusBadge status={deal.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Seller: <strong className="text-foreground">{deal.farmer_name || "Shiv Shakti Farmers"}</strong> → Buyer: <strong className="text-foreground">{deal.buyer_name}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    Delivery: {deal.destination || "Indore Processing Facility"} · Pickup date: {deal.delivery_date}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="sm:text-right">
                    <span className="text-base font-black text-emerald-800 dark:text-emerald-400">
                      ₹{deal.earnings_breakdown?.net_farmer_earnings?.toLocaleString("en-IN") || (deal.quantity * deal.price_per_quintal).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">₹{deal.price_per_quintal.toLocaleString("en-IN")}/q agreed</span>
                  </div>
                  <Button size="sm" variant="outline" asChild className="h-8 text-xs font-bold">
                    <Link href={`/orders/${deal.id}`}>
                      Deal Workspace →
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
