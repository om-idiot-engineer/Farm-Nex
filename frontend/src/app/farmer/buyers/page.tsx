"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Award,
  Scale,
  Building2,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import type { CropListing, BuyerMatchOpportunity, TradeAgreement } from "@/lib/api";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  acceptBuyerMatch,
  getBuyerMatches,
  getFarmerListings,
  type DataSource,
} from "@/lib/services/domain";
import BuyerMatchCard from "@/components/BuyerMatchCard";
import DealComparisonTable from "@/components/DealComparisonTable";
import DemoNotice from "@/components/DemoNotice";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

function FarmerFindBuyersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get("listing_id");
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [opportunities, setOpportunities] = useState<BuyerMatchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [acceptingMatchId, setAcceptingMatchId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  // Counter offer modal
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterOpp, setCounterOpp] = useState<BuyerMatchOpportunity | null>(null);
  const [counterRate, setCounterRate] = useState<number>(5380);

  useEffect(() => {
    if (!user || !hasAccess) return;

    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await getFarmerListings();
        setListings(res.data);
        setSource(res.source);

        let target = res.data[0];
        if (listingIdParam) {
          const found = res.data.find((l) => l.id === listingIdParam);
          if (found) target = found;
        }
        setSelectedListing(target || null);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [hasAccess, listingIdParam, user]);

  useEffect(() => {
    if (!selectedListing) return;

    const fetchOpportunities = async () => {
      try {
        setLoadingOpps(true);
        const res = await getBuyerMatches(selectedListing.id);
        setOpportunities(res.data);
        setSource(res.source);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to calculate buyer matches.");
      } finally {
        setLoadingOpps(false);
      }
    };

    fetchOpportunities();
  }, [selectedListing]);

  const handleAcceptDeal = async (opp: BuyerMatchOpportunity) => {
    if (!selectedListing || !user) return;
    setAcceptingMatchId(opp.match_id);
    try {
      const res = await acceptBuyerMatch(selectedListing.id, opp.demand_id, user);
      router.push(`/orders/${res.data.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to execute agreement.");
      setAcceptingMatchId(null);
    }
  };

  const handleOpenCounterOffer = (opp: BuyerMatchOpportunity) => {
    setCounterOpp(opp);
    setCounterRate(opp.offered_price_per_quintal + 50);
    setCounterModalOpen(true);
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Counter offer of ₹${counterRate}/q submitted to ${counterOpp?.business_name}. Direct message opened.`);
    setCounterModalOpen(false);
    router.push("/messages?conversation=demo-conversation-agrocorp");
  };

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const topMatch = opportunities[0];
  const otherMatches = opportunities.slice(1);

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Scale className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Flagship Match Engine
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Best Net Realization</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Transparently ranked by actual rupees kept per quintal after estimated freight and handling deductions.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/farmer/produce">
            <ArrowLeft className="mr-2 h-4 w-4" />
            My Produce Lots
          </Link>
        </Button>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Matching bids and freight calculations are synthesized from real Agmarknet freight benchmarks for Central India.
        </DemoNotice>
      )}

      {errorMsg && <ErrorState message={errorMsg} />}

      {/* Lot Selector Pill Bar */}
      {listings.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Selected Produce Lot:
          </span>
          {listings.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedListing(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedListing?.id === l.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.quantity}Q {l.commodity.toUpperCase()} · #{l.id.slice(0, 8)}
            </button>
          ))}
        </div>
      )}

      {/* Selected Lot Context Banner */}
      {selectedListing && (
        <div className="border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded border bg-amber-50 text-amber-900 border-amber-200">
                {selectedListing.commodity}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {selectedListing.quality_grade} · {selectedListing.moisture_percent || 11.2}% Moisture
              </span>
            </div>
            <p className="text-xl font-black text-foreground">
              {selectedListing.quantity} Quintals Available at Farm Gate
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary" />
              {selectedListing.location}
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Your Asking Target
            </span>
            <p className="text-xl font-black text-primary">
              ₹{selectedListing.expected_price.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/q</span>
            </p>
          </div>
        </div>
      )}

      {/* TOP DEAL SHOWCASE */}
      {loadingOpps ? (
        <LoadingSkeleton variant="card" rows={3} />
      ) : topMatch ? (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Ranked #1 Best Deal For This Lot
              </h2>
              <span className="text-xs font-semibold text-muted-foreground">
                Highest estimated net payout
              </span>
            </div>

            <BuyerMatchCard
              opportunity={topMatch}
              isTopMatch={true}
              onAccept={handleAcceptDeal}
              onCounterOffer={handleOpenCounterOffer}
              isAccepting={acceptingMatchId === topMatch.match_id}
            />
          </section>

          {/* DEAL COMPARISON TABLE */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
              All Matching Buyer Offers ({opportunities.length})
            </h2>
            <DealComparisonTable
              opportunities={opportunities}
              onSelectDeal={(opp) => handleAcceptDeal(opp)}
            />
          </section>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-10 bg-card text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-black text-foreground">No buyers currently matching this lot</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Processors in your district are not actively broadcasting requirements for this specification right now. You will be notified as new tenders arrive.
          </p>
        </div>
      )}

      {/* COUNTER OFFER MODAL */}
      {counterModalOpen && counterOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setCounterModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-black text-foreground">Propose Counter Offer</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Propose your expected rate directly to {counterOpp.business_name}.
              </p>
            </div>

            <form onSubmit={handleSendCounter} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Your Counter Price (₹/quintal)</label>
                <input
                  type="number"
                  value={counterRate}
                  onChange={(e) => setCounterRate(Number(e.target.value))}
                  className="w-full p-2.5 border border-input rounded font-black text-base outline-none focus:border-primary"
                />
              </div>

              <div className="bg-muted/20 p-2.5 rounded text-[11px] text-muted-foreground space-y-1">
                <p>Buyer Offer: ₹{counterOpp.offered_price_per_quintal.toLocaleString("en-IN")}/q</p>
                <p>Volume: {counterOpp.quantity_matched} Quintals</p>
                <p>Pickup: Farm-gate pickup provided by buyer</p>
              </div>

              <Button type="submit" className="w-full font-bold">
                Send Counter Offer
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FarmerFindBuyersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <FarmerFindBuyersContent />
    </Suspense>
  );
}
