"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Truck, 
  FileText, 
  DollarSign, 
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  getAgreements,
  getFarmerListings,
  getProcurementRequirements
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import type { CropListing } from "@/lib/api";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";

export default function DealsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["farmer", "fpo", "buyer", "admin"]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "in_transit" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || !hasAccess) return;
    async function load() {
      if (!user) return;
      try {
        const [agrRes, lstRes, rfqRes] = await Promise.all([
          getAgreements(),
          user.role === "farmer" || user.role === "fpo" ? getFarmerListings() : Promise.resolve({ data: [] }),
          user.role === "buyer" ? getProcurementRequirements() : Promise.resolve({ data: [] })
        ]);
        setAgreements(agrRes.data as ExtendedTradeAgreement[]);
        setListings(lstRes.data);
        setRfqs(rfqRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [hasAccess, user]);

  if (loading || !user || !hasAccess || loadingData) {
    return <LoadingSkeleton variant="detail" />;
  }

  const isBuyer = user.role === "buyer";
  const activeOrders = agreements.filter(a => a.status !== "completed");
  const completedOrders = agreements.filter(a => a.status === "completed");

  const filteredOrders = agreements.filter(a => {
    if (statusFilter === "active" && a.status === "completed") return false;
    if (statusFilter === "in_transit" && a.status !== "in_transit") return false;
    if (statusFilter === "completed" && a.status !== "completed") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCrop = (a.crop_id || "").toLowerCase().includes(q);
      const matchBuyer = (a.buyer_name || "").toLowerCase().includes(q);
      const matchFarmer = (a.farmer_name || "").toLowerCase().includes(q);
      const matchOrder = (a.orderNumber || a.id || "").toLowerCase().includes(q);
      return matchCrop || matchBuyer || matchFarmer || matchOrder;
    }
    return true;
  });

  const totalValue = completedOrders.reduce((sum, a) => sum + (a.quantity * a.price_per_quintal), 0);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
              Trade Desk & Deal Execution
            </span>
            <TrustBadge type={isBuyer ? "buyer" : "producer"} size="sm" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {isBuyer ? "Commercial Procurement Orders" : "Fulfillment & Trade Contracts"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBuyer
              ? "Oversee spot contracts, gate weighbridge receipts, and digital escrow payouts."
              : "Review signed purchase orders, farm gate dispatches, and guaranteed bank disbursements."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBuyer ? (
            <Button asChild size="sm" className="font-bold">
              <Link href="/buyer/requirements">Manage Requirements</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="font-bold">
              <Link href="/farmer/produce/new">+ List New Produce</Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isBuyer ? "Active RFQs" : "Active Farm Lots"}
          </span>
          <p className="text-3xl font-black text-foreground mt-2">
            {isBuyer ? rfqs.length : listings.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Orders in Execution
          </span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {activeOrders.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isBuyer ? "Supplier Bids" : "Pending Milestones"}
          </span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {isBuyer ? rfqs.reduce((acc, r) => acc + (r.responseCount || 0), 0) : activeOrders.filter(a => a.status === 'matched' || a.status === 'trade_confirmed').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Escrow Protected Volume
          </span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
            ₹{totalValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Orders Filter & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: "all", label: `All Orders (${agreements.length})` },
            { id: "active", label: `In Progress (${activeOrders.length})` },
            { id: "in_transit", label: `In Transit (${agreements.filter(a => a.status === "in_transit").length})` },
            { id: "completed", label: `Settled (${completedOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search crop, counterparty, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-xs p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Active Deal Workspace ({filteredOrders.length})
            </h2>
          </div>

          <div className="space-y-3 flex-1">
            {filteredOrders.map(order => {
              const contractVal = order.quantity * order.price_per_quintal;
              return (
                <div
                  key={order.id}
                  className="border border-border rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all bg-card/50 hover:bg-muted/10 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-foreground capitalize">
                          {order.crop_id}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          · {order.quantity} Quintals ({(order.quantity / 10).toFixed(1)} MT)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Counterparty: <strong className="text-foreground">{isBuyer ? order.farmer_name : order.buyer_name}</strong>
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-border/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Agreed Rate</span>
                      <span className="font-bold text-foreground">₹{order.price_per_quintal}/q</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Contract Payout</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">₹{contractVal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Route / Destination</span>
                      <span className="text-foreground truncate block">{order.deliveryDestination || "Milling Facility"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Ref #{order.orderNumber || order.id}
                    </span>
                    <Button variant="default" size="sm" asChild className="h-8 text-xs font-bold">
                      <Link href={`/deals/${order.id}`}>
                        Open Deal Room <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl space-y-2">
                <Package className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm font-bold">No orders found matching this filter</p>
                <p className="text-xs text-muted-foreground">Adjust your filters or initiate a transaction from the market network.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Auxiliary Panel (1 Col) */}
        <div className="bg-card border border-border rounded-xl shadow-xs p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              {isBuyer ? "Active Requirements" : "Your Harvest Supply"}
            </h2>
            <Link
              href={isBuyer ? "/buyer/requirements/new" : "/farmer/produce/new"}
              className="text-xs font-bold text-primary hover:underline"
            >
              + Create
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {!isBuyer && listings.slice(0, 5).map(lot => (
              <div key={lot.id} className="border border-border rounded-lg p-3.5 space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground capitalize">{lot.crop_id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {lot.quantity} Quintals
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Asking: ₹{lot.expected_price}/q</span>
                  <Link href="/farmer/produce" className="font-bold text-primary hover:underline text-[11px]">
                    Manage Lot
                  </Link>
                </div>
              </div>
            ))}

            {isBuyer && rfqs.slice(0, 5).map(rfq => (
              <div key={rfq.id} className="border border-border rounded-lg p-3.5 space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground capitalize">{rfq.crop_id || rfq.crop}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {rfq.quantityQuintals || rfq.quantity} Quintals
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Responses: {rfq.responseCount || 0}</span>
                  <Link href="/buyer/requirements" className="font-bold text-primary hover:underline text-[11px]">
                    View RFQ
                  </Link>
                </div>
              </div>
            ))}

            {(!isBuyer && listings.length === 0) || (isBuyer && rfqs.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl text-xs">
                No active {isBuyer ? "procurement requirements" : "harvest produce"} registered.
              </div>
            ) : null}
          </div>

          {/* Guaranteed Settlement Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-primary">
              <ShieldCheck className="h-4 w-4" /> Escrow Settlement Guarantee
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every contract on FarmNex is secured through digital escrow. Payouts trigger automatically upon tare-verified electronic weighbridge slip submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
