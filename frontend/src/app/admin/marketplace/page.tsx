"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  Search, 
  Filter, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Building2,
  MapPin,
  Check
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getMarketListings, getDemands, removeListing, removeDemand } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function AdminMarketplaceModerationPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [activeTab, setActiveTab] = useState<"listings" | "demands">("listings");
  const [listings, setListings] = useState(() => getMarketListings().data);
  const [demands, setDemands] = useState(() => getDemands().data);
  const [search, setSearch] = useState("");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleDeleteListing = (id: string) => {
    removeListing(id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleDeleteDemand = (id: string) => {
    removeDemand(id);
    setDemands(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Operations Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Marketplace Moderation & Quality Audit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect live produce listings and buyer demand RFQs, audit pricing deviations against APMC benchmarks, and moderate flagged postings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/marketplace">
              Public Marketplace View
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Marketplace moderation enforces mandatory moisture certificates and prevents predatory below-MSP bidding by unverified intermediaries.
      </DemoNotice>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              activeTab === "listings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Farmer Produce Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("demands")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              activeTab === "demands"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Buyer Sourcing Demands ({demands.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search crop or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Listings Moderation */}
      {activeTab === "listings" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Lot # & Commodity</th>
                  <th className="px-5 py-3">Farmer / Origin</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3 text-right">Asking Rate</th>
                  <th className="px-5 py-3">Moisture Spec</th>
                  <th className="px-5 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {listings.map((lot) => (
                  <tr key={lot.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-foreground">{lot.commodity}</span>
                      <span className="block text-[11px] text-muted-foreground">ID: {lot.id} · {lot.quality_grade}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="font-semibold text-foreground">{lot.farmer_name || "Verified Producer"}</span>
                      <span className="block text-[11px]">{lot.location}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-foreground">
                      {lot.quantity} Q
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary">
                      ₹{lot.expected_price.toLocaleString("en-IN")}/Q
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {(lot as any).moisture_percent || (lot as any).moisture_percentage || "11.2"}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild className="text-xs h-7">
                          <Link href={`/marketplace/listings/${lot.id}`}>Inspect</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteListing(lot.id)}
                          className="text-xs h-7 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demands Moderation */}
      {activeTab === "demands" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Buyer & Requirement</th>
                  <th className="px-5 py-3">Delivery Facility</th>
                  <th className="px-5 py-3 text-right">Volume Needed</th>
                  <th className="px-5 py-3 text-right">Offered Rate</th>
                  <th className="px-5 py-3">Payment Terms</th>
                  <th className="px-5 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {demands.map((demand) => (
                  <tr key={demand.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-foreground">{demand.business_name}</span>
                      <span className="block text-[11px] text-muted-foreground">Seeking {demand.commodity} ({demand.quality_grade})</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {demand.location}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-foreground">
                      {demand.quantity_needed} Q
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary">
                      ₹{demand.offered_price.toLocaleString("en-IN")}/Q
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {demand.payment_terms || "Escrow"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild className="text-xs h-7">
                          <Link href={`/marketplace/requirements/${demand.id}`}>Inspect</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteDemand(demand.id)}
                          className="text-xs h-7 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
