"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Truck,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Award,
  Send,
  Star,
  Eye,
  BarChart2,
  UsersRound,
  MessageSquare,
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getBuyerMatches, getListingDetail } from "@/lib/services/domain";
import type { CropListing, BuyerMatchOpportunity } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export default function BuyerComparisonPageWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <BuyerComparisonPage />
    </Suspense>
  );
}

function BuyerComparisonPage() {
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing_id");

  const [listing, setListing] = useState<CropListing | null>(null);
  const [matches, setMatches] = useState<BuyerMatchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<BuyerMatchOpportunity | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadData = async () => {
    if (!listingId) {
      setErrorMsg("No listing specified. Please select a crop lot from your produce page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const [listingRes, matchesRes] = await Promise.all([
        getListingDetail(listingId),
        getBuyerMatches(listingId),
      ]);
      setListing(listingRes.data);
      setMatches(matchesRes.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load buyer matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, user, listingId]);

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const getGradient = (crop: string) => {
    const l = crop.toLowerCase();
    if (l.includes("tomato")) return "from-red-400 to-orange-400";
    if (l.includes("wheat")) return "from-amber-300 to-yellow-500";
    if (l.includes("potato")) return "from-orange-300 to-amber-600";
    if (l.includes("soybean") || l.includes("soy")) return "from-green-300 to-emerald-500";
    if (l.includes("onion")) return "from-fuchsia-400 to-purple-500";
    if (l.includes("cotton")) return "from-indigo-300 to-purple-500";
    return "from-zinc-400 to-zinc-600";
  };

  const getEmoji = (crop: string) => {
    const l = crop.toLowerCase();
    if (l.includes("tomato")) return "🍅";
    if (l.includes("wheat")) return "🌾";
    if (l.includes("potato")) return "🥔";
    if (l.includes("soybean") || l.includes("soy")) return "🌱";
    if (l.includes("onion")) return "🧅";
    if (l.includes("cotton")) return "🌿";
    return "📦";
  };

  const formatNumber = (num: number) => num.toLocaleString("en-IN");

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground p-0 hover:bg-transparent mb-2">
            <Link href="/farmer/produce">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to My Produce
            </Link>
          </Button>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <UsersRound className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Buyer Comparison
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Compare Buyer Offers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {listing
              ? `Ranked by net farm-gate realization for your ${listing.quantity}Q ${listing.crop_id} lot`
              : "Select a listing to view matched buyers"}
          </p>
        </div>
      </div>

      {errorMsg && (
        <EmptyState
          title="Unable to Load Matches"
          description={errorMsg}
          action="Back to Produce"
          href="/farmer/produce"
          icon={AlertCircle}
        />
      )}

      {listing && (
        <>
          {/* Lot Summary Card */}
          <div className="bg-white rounded-[20px] border border-border p-5 shadow-sm">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getGradient(listing.crop_id)} flex items-center justify-center text-[36px] shadow-inner`}>
                  {getEmoji(listing.crop_id)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Lot #{listing.id.slice(0, 12)}
                    </span>
                    <h2 className="text-xl font-black capitalize text-foreground">
                      {listing.quantity}Q {listing.crop_id}
                    </h2>
                  </div>
                  <StatusBadge status={listing.status} size="sm" />
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                      {listing.quality_grade} · {listing.moisture_percent || "N/A"}% moisture
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-emerald-500 shrink-0" />
                      Asking: ₹{listing.expected_price.toLocaleString("en-IN")}/Q
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right lg:text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Est. Net Realization Range
                </span>
                <span className="text-2xl font-extrabold text-emerald-700">
                  ₹{matches.length > 0
                    ? matches[0].net_realization_per_quintal.toLocaleString("en-IN")
                    : listing.expected_price - 100}/Q
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  vs ₹{listing.expected_price.toLocaleString("en-IN")}/Q asking
                </span>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-[14px] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-zinc-500" />
                {matches.length} Matched Buyers
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Ranked by Net Realization
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.8+ avg rating
              </div>
            </div>

            {loading ? (
              <div className="p-8">
                <LoadingSkeleton variant="card" rows={matches.length || 3} />
              </div>
            ) : matches.length === 0 ? (
              <div className="p-12 text-center">
                <EmptyState
                  title="No buyer matches yet"
                  description="Your listing has been published. Verified buyers matching your crop and quality criteria will appear here as they submit offers."
                  action="View in Marketplace"
                  href={`/marketplace/listings/${listing.id}`}
                  icon={UsersRound}
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {matches.map((match, index) => (
                  <div
                    key={match.match_id}
                    className={`p-5 transition-all hover:bg-zinc-50/50 ${
                      index === 0 ? "bg-emerald-50/30 border-l-4 border-l-emerald-500" : ""
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Buyer Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-[14px] text-white shrink-0 ${index === 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg" : "bg-gradient-to-br from-zinc-400 to-zinc-600"}`}>
                          {match.buyer_name?.substring(0, 2).toUpperCase() || "BY"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-[15px] text-zinc-900 truncate">
                              {match.business_name || match.buyer_name}
                            </h3>
                            {match.buyer_verified && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                              {match.distance_km} km away
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Truck className="h-3 w-3 text-zinc-400 shrink-0" />
                              Freight: ₹{match.estimated_logistics_per_quintal.toLocaleString("en-IN")}/Q
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {match.score_breakdown?.reliability_score || 95}% reliability
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price Comparison */}
                      <div className="flex flex-col lg:items-end lg:flex-row lg:gap-6 items-start lg:items-center gap-4 w-full lg:w-auto shrink-0">
                        {/* Offered Price */}
                        <div className="text-center lg:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Buyer Offered Rate
                          </span>
                          <span className="text-xl font-black text-zinc-900">
                            ₹{match.offered_price_per_quintal.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-muted-foreground block">Per Quintal</span>
                        </div>

                        {/* Logistics */}
                        <div className="text-center lg:text-right border-l border-zinc-200 lg:border-0 lg:border-t lg:pt-3 pl-4 lg:pl-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Est. Freight Deduction
                          </span>
                          <span className="text-lg font-bold text-rose-600">
                            -₹{match.estimated_logistics_per_quintal.toLocaleString("en-IN")}/Q
                          </span>
                          <span className="text-xs text-muted-foreground block">Total: -₹{match.estimated_total_logistics.toLocaleString("en-IN")}</span>
                        </div>

                        {/* Net Realization - HIGHLIGHT */}
                        <div className="text-center lg:text-right bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[160px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                            Net In Pocket
                          </span>
                          <span className="text-2xl font-extrabold text-emerald-800">
                            ₹{match.net_realization_per_quintal.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold block">Per Quintal</span>
                          <div className="mt-1 pt-1 border-t border-emerald-200 text-xs text-emerald-700 font-bold">
                            Total: ₹{match.net_total_realization.toLocaleString("en-IN")}
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="text-center lg:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Match Score
                          </span>
                          <div className="flex items-center justify-center lg:justify-end gap-2">
                            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{
                              borderColor: match.matching_score >= 90 ? "#10B981" : match.matching_score >= 75 ? "#F59E0B" : "#EF4444",
                              background: match.matching_score >= 90 ? "rgba(16, 185, 129, 0.1)" : match.matching_score >= 75 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)"
                            }}>
                              <span className="font-extrabold text-[18px]" style={{ color: match.matching_score >= 90 ? "#10B981" : match.matching_score >= 75 ? "#F59E0B" : "#EF4444" }}>
                                {match.matching_score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why This Offer - Expandable */}
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMatch(match);
                          setShowDetail(true);
                        }}
                        className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View detailed breakdown & why this offer ranks here
                      </button>

                      <div className="mt-3 flex flex-wrap gap-2" style={{ maxHeight: showDetail && selectedMatch?.match_id === match.match_id ? "200px" : "0" }}>
                        {match.why_this_offer.map((reason, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <Link href={`/messages?buyer=${match.buyer_id}&listing=${listing.id}&demand=${match.demand_id}`}>
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Chat
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <Link href={`/profile/${match.buyer_id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="text-xs font-bold bg-gradient-to-br from-emerald-600 to-green-600 shadow-sm"
                      >
                        <Link href={`/deals/new?listing=${listing.id}&demand=${match.demand_id}&buyer=${match.buyer_id}`}>
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Accept & Create Deal
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scoring Explanation */}
          <div className="bg-white rounded-[20px] border border-border p-5 shadow-sm">
            <h3 className="font-bold text-[13px] uppercase tracking-wider text-zinc-900 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              How Buyers Are Ranked
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: "Net Realization", weight: "45%", desc: "Your pocket earnings after freight" },
                { label: "Offered Price", weight: "20%", desc: "Buyer's headline rate per quintal" },
                { label: "Distance", weight: "15%", desc: "Transport cost & weight-loss risk" },
                { label: "Quantity Fit", weight: "8%", desc: "Can they take your full lot?" },
                { label: "Quality Match", weight: "5%", desc: "Grade & moisture alignment" },
                { label: "Reliability", weight: "5%", desc: "Payment track record & ratings" },
                { label: "Availability", weight: "2%", desc: "Confirmed pickup capacity" },
              ].map((factor) => (
                <div key={factor.label} className="p-3 rounded-lg bg-zinc-50/50 border border-zinc-100">
                  <div className="font-bold text-zinc-900">{factor.label}</div>
                  <div className="text-emerald-700 font-black">{factor.weight}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">{factor.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!listing && !loading && !errorMsg && (
        <EmptyState
          title="Select a Listing"
          description="Navigate from your Produce page to compare buyer offers for a specific crop lot."
          action="Go to My Produce"
          href="/farmer/produce"
          icon={ArrowLeft}
        />
      )}
    </div>
  );
}