"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Building2, 
  FileText, 
  DollarSign, 
  ShieldCheck,
  Eye
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAgreements } from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";

export default function OrdersListPage() {
  const { user, loading, hasAccess } = useRequiredUser(["farmer", "buyer", "fpo", "admin"]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user || !hasAccess) return;
    async function load() {
      try {
        const res = await getAgreements();
        setAgreements(res.data as ExtendedTradeAgreement[]);
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

  const filtered = agreements.filter((ord) => {
    const matchesSearch = ord.commodity.toLowerCase().includes(search.toLowerCase()) ||
      (ord.buyer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (ord.farmer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      ord.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ord.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-primary">
              Order Fulfillment Registry
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {user.role.toUpperCase()} Workspace
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Trade Agreements & Consignments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track multi-stage physical dispatches, weighbridge verification slips, and digital escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/marketplace">
              New Trade Agreement
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Every consignment is tracked across 8 physical verification stages: from digital escrow locking to weighbridge tare settlement.
      </DemoNotice>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, commodity, or counterparty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Stages</option>
            <option value="matched">Trade Confirmed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered / Weighed</option>
            <option value="completed">Escrow Settled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No matching orders found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search criteria.</p>
          </div>
        ) : (
          filtered.map((ord) => {
            const qty = ord.quantity || ord.agreed_quantity || 100;
            const rate = ord.price_per_quintal || ord.agreed_price || 5000;
            const grossValue = qty * rate;
            const netRealized = ord.net_farmer_realization || Math.round(grossValue * 0.98);

            return (
              <div key={ord.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase text-primary">
                        Order #{ord.orderNumber || ord.id}
                      </span>
                      <StatusBadge status={ord.status} />
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Agreement Date: {ord.created_at || "Recent"}</span>
                    </div>

                    <h2 className="text-xl font-black text-foreground mt-1">
                      {qty} Quintals {ord.commodity}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Buyer: <strong className="text-foreground">{ord.buyer_name || "Institutional Buyer"}</strong></span>
                      <span>•</span>
                      <span>Farmer/FPO: <strong className="text-foreground">{ord.farmer_name || "Verified Producer"}</strong></span>
                      <span>•</span>
                      <span>Delivery: {ord.deliveryDestination || ord.destination || "Factory Gate"}</span>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {user.role === "buyer" ? "Contracted Amount" : "Net Farmer Payout"}
                      </span>
                      <p className="text-xl font-black text-primary">
                        ₹{(user.role === "buyer" ? grossValue : netRealized).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ₹{rate.toLocaleString("en-IN")}/Q (Agreed Rate)
                      </p>
                    </div>

                    <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                      <Link href={`/orders/${ord.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Open Transaction Workspace
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Tracking Checkpoint Snapshot */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>
                      Carrier: <strong>{ord.transporterName || "Express Agri Freight"}</strong> ({ord.vehicleNumber || "MP-09-GH-4412"})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>100% Escrow Funded & Verified</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
