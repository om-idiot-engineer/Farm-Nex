"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Scale, 
  Building2, 
  FileText, 
  MapPin, 
  TrendingUp,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { 
  getAdminOverview, 
  getAdminUsers, 
  getAdminDisputes, 
  getAdminMap,
  type DataSource 
} from "@/lib/services/domain";
import type { AdminKPIData, AdminMapResponse, MapNode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function AdminOverviewPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [stats, setStats] = useState<AdminKPIData | null>(null);
  const [mapData, setMapData] = useState<AdminMapResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  const usersList = getAdminUsers().data;
  const disputesList = getAdminDisputes().data;

  const pendingUsers = usersList.filter(u => !u.verified);
  const activeDisputes = disputesList.filter(d => d.status === "Open" || d.status === "Under Review");

  useEffect(() => {
    if (!user || !hasAccess) return;
    async function fetchStats() {
      try {
        const [statsRes, mapRes] = await Promise.all([getAdminOverview(), getAdminMap()]);
        setStats(statsRes.data);
        setMapData(mapRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchStats();
  }, [hasAccess, user]);

  if (loading || !user || !hasAccess || loadingData) {
    return <LoadingSkeleton variant="detail" />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Platform Governance
            </span>
            <span className="text-xs font-bold text-muted-foreground">Admin Superuser</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Agricultural Marketplace Operations Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor real-time liquidity, KYC verifications, commercial trade escrow flows, and dispute arbitrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/users">
              <Users className="mr-1.5 h-4 w-4" />
              KYC Queue ({pendingUsers.length})
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
            <Link href="/admin/disputes">
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              Disputes ({activeDisputes.length})
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Platform analytics display aggregated supply/demand nodes across Madhya Pradesh and track verified weighbridge and escrow settlements.
      </DemoNotice>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connected Farmers & FPOs</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{stats?.total_farmers_connected || 248}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Across 14 districts in MP
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Listings & Demand</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {(stats?.total_active_listings || 0) + (stats?.total_active_demands || 0)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {stats?.total_active_listings} Supply · {stats?.total_active_demands} Buyer RFQs
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trade Volume Settled</span>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {((stats?.total_trade_volume_quintals || 9240) * 5100 / 10000000).toFixed(2)} Cr
          </p>
          <p className="mt-0.5 text-xs text-emerald-700 font-medium">
            100% On-time Escrow Settlement
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Logistics Savings</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            ₹{stats?.total_estimated_logistics_savings_inr?.toLocaleString("en-IN") || "1,86,400"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Via route bundling & direct farmgate pickup
          </p>
        </div>
      </div>

      {/* Operational Modules Quick Access */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link 
          href="/admin/users" 
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <div className="rounded-md bg-blue-100 p-2 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold">User KYC Queue</p>
            <p className="text-[11px] text-muted-foreground">{pendingUsers.length} awaiting review</p>
          </div>
        </Link>

        <Link 
          href="/admin/marketplace" 
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <div className="rounded-md bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold">Market Moderation</p>
            <p className="text-[11px] text-muted-foreground">Lots & RFQ inspection</p>
          </div>
        </Link>

        <Link 
          href="/admin/transactions" 
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <div className="rounded-md bg-amber-100 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold">Escrows & Payouts</p>
            <p className="text-[11px] text-muted-foreground">Settlement ledger</p>
          </div>
        </Link>

        <Link 
          href="/admin/disputes" 
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <div className="rounded-md bg-rose-100 p-2 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold">Dispute Arbitration</p>
            <p className="text-[11px] text-muted-foreground">{activeDisputes.length} active cases</p>
          </div>
        </Link>
      </div>

      {/* Main 2-Col Grid: Pending Verifications & Regional Supply Nodes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Queue Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Pending User KYC Verifications</h2>
              <p className="text-xs text-muted-foreground">Review identity, land records, and GST credentials</p>
            </div>
            <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">
              View All ({usersList.length})
            </Link>
          </div>

          <div className="divide-y divide-border">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                All registered users verified!
              </div>
            ) : (
              pendingUsers.slice(0, 4).map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{u.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{u.location} · {u.phone}</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{u.documentType}: {u.documentId}</p>
                  </div>

                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/admin/users">
                      Inspect KYC
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Disputes Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Dispute Arbitration Desk</h2>
              <p className="text-xs text-muted-foreground">Moisture discrepancy, weighbridge variance, or transit delays</p>
            </div>
            <Link href="/admin/disputes" className="text-xs font-bold text-primary hover:underline">
              View All ({disputesList.length})
            </Link>
          </div>

          <div className="divide-y divide-border">
            {disputesList.slice(0, 3).map((d) => (
              <div key={d.id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-primary">Case #{d.id}</span>
                    <span className="text-muted-foreground">Deal #{d.dealId || d.orderNumber}</span>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <p className="font-semibold text-foreground">{d.reason}</p>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Claimant: <strong>{d.raisedBy || "Claimant"}</strong> vs {d.against || "Opposing Party"}</span>
                  <span className="font-mono">Hold: ₹{(d.disputedAmount || d.amount || 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <Button asChild size="sm" variant="outline" className="text-xs h-7">
                    <Link href="/admin/disputes">
                      Arbitrate Case
                    </Link>
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
