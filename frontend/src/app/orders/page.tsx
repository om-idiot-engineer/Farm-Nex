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

export default function BusinessDashboardPage() {
  const { user, loading, hasAccess } = useRequiredUser(["farmer", "fpo", "buyer", "admin"]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  const totalValue = completedOrders.reduce((sum, a) => sum + (a.quantity * a.price_per_quintal), 0);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
              Business Operations
            </span>
            <TrustBadge type={isBuyer ? "buyer" : "producer"} size="sm" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {isBuyer ? "Procurement & Fulfillment" : "Sales & Dispatches"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBuyer
              ? "Manage active RFQs, supplier negotiations, and inbound deliveries."
              : "Track active listings, buyer interest, and secure escrow payouts."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBuyer ? (
            <Button asChild size="sm" className="font-bold">
              <Link href="/buyer/procurement">Manage RFQs</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="font-bold">
              <Link href="/farmer/produce">Manage Supply</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isBuyer ? "Active Requirements" : "Active Listings"}
            </span>
            <p className="text-3xl font-black text-foreground mt-2">
              {isBuyer ? rfqs.length : listings.length}
            </p>
         </div>
         <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              In-Transit Orders
            </span>
            <p className="text-3xl font-black text-blue-600 mt-2">
              {activeOrders.length}
            </p>
         </div>
         <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isBuyer ? "Supplier Responses" : "Pending Actions"}
            </span>
            <p className="text-3xl font-black text-amber-600 mt-2">
              {isBuyer ? rfqs.reduce((acc, r) => acc + (r.responseCount || 0), 0) : activeOrders.filter(a => a.status === 'matched' || a.status === 'trade_confirmed').length}
            </p>
         </div>
         <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total {isBuyer ? "Spent" : "Sales"} (Escrowed)
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-2">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Orders Panel */}
         <div className="bg-card border border-border rounded-xl shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                 Active Fulfillment ({activeOrders.length})
              </h2>
            </div>

            <div className="space-y-3 flex-1">
               {activeOrders.map(order => (
                 <div key={order.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="font-bold text-foreground">{order.commodity} • {order.quantity}Q</p>
                         <p className="text-xs text-muted-foreground mt-0.5">
                           With {isBuyer ? order.farmer_name : order.buyer_name}
                         </p>
                       </div>
                       <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                       <span className="text-sm font-bold text-foreground">
                          ₹{(order.quantity * order.price_per_quintal).toLocaleString("en-IN")}
                       </span>
                       <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-bold">
                          <Link href={`/orders/${order.id}`}>View Details <ArrowRight className="h-3 w-3 ml-1"/></Link>
                       </Button>
                    </div>
                 </div>
               ))}
               {activeOrders.length === 0 && (
                 <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
                   No active orders right now.
                 </div>
               )}
            </div>
         </div>

         {/* Secondary Panel (Listings or RFQs) */}
         <div className="bg-card border border-border rounded-xl shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                 {isBuyer ? "Procurement Tracking" : "Supply Listings"}
              </h2>
            </div>

            <div className="space-y-3 flex-1">
               {!isBuyer && listings.map(lot => (
                 <div key={lot.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{lot.quantity}Q {lot.commodity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Listed for ₹{lot.expected_price}/q</p>
                    </div>
                    <div className="text-right">
                       <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                         Active
                       </span>
                       <Link href="/farmer/produce" className="block text-xs font-bold text-primary hover:underline mt-1">
                         Manage
                       </Link>
                    </div>
                 </div>
               ))}
               {isBuyer && rfqs.slice(0,4).map(rfq => (
                 <div key={rfq.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{rfq.quantityQuintals || rfq.quantity}Q {rfq.commodity || rfq.crop}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Responses: {rfq.responseCount || 0}</p>
                    </div>
                    <div className="text-right">
                       <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                         {rfq.status}
                       </span>
                       <Link href={`/buyer/procurement`} className="block text-xs font-bold text-primary hover:underline mt-1">
                         View
                       </Link>
                    </div>
                 </div>
               ))}
               {(!isBuyer && listings.length === 0) || (isBuyer && rfqs.length === 0) ? (
                 <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
                   No active {isBuyer ? "requirements" : "listings"}.
                 </div>
               ) : null}
            </div>
         </div>
      </div>
    </div>
  );
}
