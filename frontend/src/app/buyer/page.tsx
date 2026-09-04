"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Layers, 
  Search, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  MapPin, 
  SlidersHorizontal,
  Send,
  FileText,
  DollarSign,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { 
  getProcurementRequirements, 
  getMarketListings, 
  getFpoSupply,
  getBuyerDemands,
  createDemand
} from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";

export default function BuyerDashboardPage() {
  const { user, loading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const [rfqs, setRfqs] = useState(() => getProcurementRequirements().data);
  const listings = getMarketListings().data;
  const fpoSupply = getFpoSupply().data;

  // New RFQ Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [commodity, setCommodity] = useState<"soybean" | "wheat" | "cotton">("soybean");
  const [quantity, setQuantity] = useState("500");
  const [grade, setGrade] = useState("Grade A (Export / Milling)");
  const [targetPrice, setTargetPrice] = useState("5350");
  const [deliveryLocation, setDeliveryLocation] = useState(user?.buyer_profile?.location || "Dewas Processing Plant");
  const [moistureMax, setMoistureMax] = useState("10.5");
  const [submitting, setSubmitting] = useState(false);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDemand({
        commodity,
        quantity_needed: parseInt(quantity) || 100,
        quality_grade: grade,
        offered_price: parseInt(targetPrice) || 5000,
        moisture_max: parseFloat(moistureMax) || undefined,
        location: deliveryLocation,
        payment_terms: "Immediate Escrow",
        lat: 22.9676,
        lng: 76.0534,
      }, user);

      // Refresh RFQs
      setRfqs(getProcurementRequirements().data);
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCommittedQuintals = rfqs.reduce((sum, r) => sum + (r.quantityQuintals || r.quantity || 0), 0);
  const totalResponses = rfqs.reduce((sum, r) => sum + r.responseCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Institutional Procurement Center
            </span>
            <TrustBadge type="buyer" size="sm" />
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {user.buyer_profile?.business_name || user.name || "AgroCorp Processing Mills"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Direct farmer and FPO aggregate sourcing, contract settlement, and multi-hub destination delivery management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/buyer/discover">
              <Search className="mr-1.5 h-4 w-4" />
              Discover Farm Supply
            </Link>
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="bg-primary text-primary-foreground">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Publish New RFQ
          </Button>
        </div>
      </div>

      <DemoNotice>
        Broadcasted procurement RFQs automatically calculate freight differentials and match with verified farmer lots and FPO aggregated batches.
      </DemoNotice>

      {/* CONSOLIDATED PROCUREMENT COMMAND STRIP */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Active Tenders & RFQs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{rfqs.length} Open</span>
              <span className="text-xs font-semibold text-primary">({totalResponses} bids)</span>
            </div>
            <Link href="/buyer/procurement" className="text-[11px] font-bold text-primary hover:underline block">
              Manage RFQ responses →
            </Link>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Committed Volume
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{totalCommittedQuintals.toLocaleString("en-IN")} Q</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Across active tenders</p>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Escrow Protection
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800">100% Locked</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Releases post weighbridge receipt</p>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Direct Farmer Sourcing
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">84%</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                -4.8% brokerage
              </span>
            </div>
            <Link href="/buyer/discover" className="text-[11px] font-bold text-primary hover:underline block">
              Discover farm lots →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active RFQs & Real-time Matching Supply */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active RFQs */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Active Procurement RFQs</h2>
                <p className="text-xs text-muted-foreground">Broadcasted demand posts open for farmer and FPO quotations</p>
              </div>
              <Link href="/buyer/procurement" className="text-xs font-bold text-primary hover:underline">
                View All RFQs ({rfqs.length})
              </Link>
            </div>

            <div className="divide-y divide-border">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="p-4 transition-colors hover:bg-muted/20">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">
                          {rfq.quantityQuintals || rfq.quantity}Q {rfq.commodity || rfq.crop}
                        </span>
                        <StatusBadge status={rfq.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Target: <strong className="text-foreground">₹{(rfq.targetPricePerQuintal || 5200).toLocaleString("en-IN")}/Q</strong></span>
                        <span>•</span>
                        <span>Delivery: <strong className="text-foreground">{rfq.deliveryDestination || rfq.destination}</strong></span>
                        <span>•</span>
                        <span>Deadline: <strong className="text-foreground">{rfq.deadline || rfq.neededBy}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-foreground">
                        {rfq.matchedSuppliers?.length || 0} Matches
                      </span>
                      <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                        <Link href={`/buyer/procurement/${rfq.id}`}>
                          Manage Responses ({rfq.responseCount})
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Compatibility Available Lots */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Immediate Available Supply Lots</h2>
                <p className="text-xs text-muted-foreground">Verified produce listings within 100km radius matching your active specs</p>
              </div>
              <Link href="/buyer/discover" className="text-xs font-bold text-primary hover:underline">
                Explore Full Directory
              </Link>
            </div>

            <div className="divide-y divide-border">
              {listings.slice(0, 3).map((lot: any) => (
                <div key={lot.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {lot.quantity} Quintals {lot.commodity} ({lot.quality_grade})
                      </span>
                      <TrustBadge type="producer" size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Origin: {lot.location} · Asking: <strong className="text-foreground">₹{lot.expected_price.toLocaleString("en-IN")}/Q</strong> · Moisture: {lot.moisture_percentage || "11.2"}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link href={`/marketplace/listings/${lot.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                      <Link href={`/messages?recipientId=${lot.user_id}&subject=Procurement Inquiry for ${lot.commodity}`}>
                        Make Offer
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: FPO Pooled Batches & Logistics Overview */}
        <div className="space-y-6">
          {/* FPO Bulk Batches */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">FPO Pooled Batches</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600">Truckload Scale</span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Single-contract aggregated lots sourced directly from registered farmer producer companies.
            </p>

            <div className="mt-4 space-y-3">
              {fpoSupply.slice(0, 3).map((batch) => (
                <div key={batch.id} className="rounded-lg border border-border bg-muted/20 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{batch.quantity}Q {batch.crop}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{batch.quality}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Moisture: {batch.moisture}</span>
                    <span>{batch.members} Smallholders</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border/60">
                    <span className="text-muted-foreground text-[11px]">{batch.collectionCenter}</span>
                    <Link 
                      href={`/messages?recipientId=demo-fpo&subject=Inquiry for Pooled Lot ${batch.id}`}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Negotiate Batch →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sourcing Security Assurance */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-blue-900 dark:text-blue-300">Direct Contract Security</p>
                <p className="mt-1 text-blue-800/80 dark:text-blue-400/90 leading-relaxed">
                  Funds remain locked in digital escrow until electronic weighbridge tare/gross receipts and certified lab moisture reports are submitted and matched against contract parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish RFQ Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Publish Procurement RFQ</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Commodity</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as any)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="soybean">Soybean (Yellow)</option>
                    <option value="wheat">Wheat (Sharbati/Lokwan)</option>
                    <option value="cotton">Cotton (Medium Staple)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Quantity Needed (Quintals)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Offered Price (₹/Quintal)</label>
                  <input
                    type="number"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Max Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moistureMax}
                    onChange={(e) => setMoistureMax(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Quality Grade Specification</label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Delivery Destination Warehouse</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                  {submitting ? "Broadcasting..." : "Broadcast to Farmers & FPOs"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
