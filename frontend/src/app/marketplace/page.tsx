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
} from "lucide-react";
import type { CropListing, DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getDemandPosts, getMarketplaceListings, type DataSource } from "@/lib/services/domain";
import CropLotCard from "@/components/CropLotCard";
import BuyerRequirementCard from "@/components/BuyerRequirementCard";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

type MarketplaceView = "supply" | "requirements";

export default function MarketplacePage() {
  const { user } = useUser();
  const [view, setView] = useState<MarketplaceView>("supply");
  const [commodity, setCommodity] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMarketplace = async () => {
    setLoading(true);
    setError("");
    try {
      const selectedCommodity = commodity === "all" ? undefined : commodity;
      const [supplyResult, demandResult] = await Promise.all([
        getMarketplaceListings(selectedCommodity),
        getDemandPosts(selectedCommodity),
      ]);
      setListings(supplyResult.data);
      setDemands(demandResult.data);
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
      : "/";
  const actionLabel =
    user?.role === "buyer"
      ? "Post Buyer RFQ"
      : user?.role === "farmer"
      ? "List Produce Lot"
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
              Direct Agricultural Marketplace
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Supply & Active Buyer Needs</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare harvest lots, moisture assays, asking rates, and verified processor demand in Central India.
          </p>
        </div>

        <Button asChild className="font-bold shrink-0 shadow-sm">
          <Link href={actionHref}>
            <Plus className="h-4 w-4 mr-1.5" />
            {actionLabel}
          </Link>
        </Button>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Marketplace lots and buyer requirements are development records when live backend endpoints are disconnected.
        </DemoNotice>
      )}

      {error && <ErrorState message={error} onRetry={loadMarketplace} />}

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-border pb-4">
        {/* View Tabs */}
        <div className="inline-flex rounded-lg border border-border bg-card p-1 shrink-0">
          <button
            type="button"
            onClick={() => setView("supply")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              view === "supply"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Available Produce Lots ({filteredListings.length})
          </button>
          <button
            type="button"
            onClick={() => setView("requirements")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              view === "requirements"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buyer Requirements ({filteredDemands.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by city, farmer, buyer..."
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

      {/* Content Grid */}
      {loading ? (
        <LoadingSkeleton variant="card" rows={6} />
      ) : view === "supply" ? (
        filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => (
              <CropLotCard
                key={listing.id}
                listing={listing}
                buyerMatchCount={listing.commodity === "soybean" ? 3 : 1}
              />
            ))}
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
      ) : filteredDemands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDemands.map((demand) => (
            <BuyerRequirementCard key={demand.id} demand={demand} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No buyer requirements found"
          description="Try broadening your crop selection or post a new procurement tender."
          action="Post Procurement Demand"
          href="/buyer/procurement"
          icon={Building2}
        />
      )}
    </div>
  );
}
