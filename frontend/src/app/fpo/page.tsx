"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, 
  MapPin, 
  PlusCircle, 
  Building2, 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { 
  getFpoMembers, 
  getFpoSupply, 
  getFpoCollectionCenters, 
  getFpoLogistics,
  getDemands
} from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FpoDashboardPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const { t } = useLanguage();

  const membersResult = getFpoMembers();
  const supplyResult = getFpoSupply();
  const centersResult = getFpoCollectionCenters();
  const logisticsResult = getFpoLogistics();
  const demandsResult = getDemands();

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const members = membersResult.data;
  const supplyLots = supplyResult.data;
  const collectionCenters = centersResult.data;
  const logisticsBatches = logisticsResult.data;
  const buyerDemands = demandsResult.data.slice(0, 3);

  const totalAvailable = members.reduce((sum, m) => sum + m.availableQuantity, 0);
  const totalPooled = supplyLots.reduce((sum, s) => sum + s.quantity, 0);
  const totalDelivered = members.reduce((sum, m) => sum + m.deliveredQuantity, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-primary">
              FPO Collective Operations
            </span>
            <TrustBadge type="fpo" size="sm" />
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {user.fpo_profile?.organization_name || user.name || "Malwa Kisan Samriddhi FPC"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregate smallholder supply, execute bulk buyer contracts, and distribute transparent net realization to farmer members.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/fpo/members">
              <Users className="mr-1.5 h-4 w-4" />
              Member Ledger
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/fpo/supply">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Pool New Lot
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        FPO collective operations demonstrate live multi-member lot aggregation, collection center telemetry, and buyer procurement matching.
      </DemoNotice>

      {/* CONSOLIDATED COLLECTIVE OPERATIONS COMMAND STRIP */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Active Members
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{members.length}</span>
              <span className="text-xs font-semibold text-primary">
                ({members.filter(m => m.verified).length} verified)
              </span>
            </div>
            <Link href="/fpo/members" className="text-[11px] font-bold text-primary hover:underline block">
              Member roster & KYC →
            </Link>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Available Supply
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{totalAvailable.toLocaleString("en-IN")} Q</span>
            </div>
            <Link href="/fpo/supply" className="text-[11px] font-bold text-primary hover:underline block">
              Across {supplyLots.length} crop lots →
            </Link>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Pooled For Buyers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{totalPooled.toLocaleString("en-IN")} Q</span>
            </div>
            <Link href="/fpo/requirements" className="text-[11px] font-bold text-primary hover:underline block">
              Match {buyerDemands.length} buyer RFQs →
            </Link>
          </div>

          <div className="space-y-0.5 border-l border-border pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Realized
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">₹{(totalDelivered * 4850).toLocaleString("en-IN")}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                +11.4% mandi
              </span>
            </div>
            <Link href="/fpo/deals" className="text-[11px] font-bold text-primary hover:underline block">
              Payouts ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active Pooled Supply & Matching Demand */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pooled Supply Lots */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Pooled Supply Lots</h2>
                <p className="text-xs text-muted-foreground">Standardized lots aggregating multiple smallholder farmer yields</p>
              </div>
              <Link href="/fpo/supply" className="text-xs font-bold text-primary hover:underline">
                View all ({supplyLots.length})
              </Link>
            </div>

            <div className="divide-y divide-border">
              {supplyLots.map((lot) => (
                <div key={lot.id} className="p-4 transition-colors hover:bg-muted/20">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">
                          {lot.quantity} Quintals {lot.crop}
                        </span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {lot.quality}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Moisture: <strong className="text-foreground">{lot.moisture}</strong></span>
                        <span>•</span>
                        <span>Pooled from <strong className="text-foreground">{lot.members} smallholders</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lot.collectionCenter}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={lot.status === "pooled" ? "ready" : "in_negotiation"} />
                      <Button asChild size="sm" variant="outline" className="text-xs">
                        <Link href="/fpo/requirements">Match Buyer</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Match Buyer Demands */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Immediate Buyer Procurement Demands</h2>
                <p className="text-xs text-muted-foreground">Verified bulk institutional buyers seeking quantities your FPO can fulfill</p>
              </div>
              <Link href="/fpo/requirements" className="text-xs font-bold text-primary hover:underline">
                Explore RFQs
              </Link>
            </div>

            <div className="divide-y divide-border">
              {buyerDemands.map((demand: any) => (
                <div key={demand.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm">
                        {demand.business_name || demand.buyer_name || "Institutional Buyer"}
                      </h3>
                      <TrustBadge type="buyer" size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seeking <strong className="text-foreground">{demand.quantity_needed}Q {demand.commodity}</strong> ({demand.quality_grade}) · Destination: {demand.location}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="font-bold text-primary">Offered Rate: ₹{demand.offered_price.toLocaleString("en-IN")}/q</span>
                      <span className="text-muted-foreground">Target Date: {demand.target_date}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" className="bg-primary text-primary-foreground shrink-0">
                    <Link href={`/messages?recipientId=${demand.buyer_id || demand.user_id || "demo-buyer"}&subject=Offer for ${demand.commodity}`}>
                      Send Collective Offer
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Collection Centers & Smallholder Readiness */}
        <div className="space-y-6">
          {/* Collection Center Operations */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Collection Hubs</h3>
              </div>
              <Link href="/fpo/logistics" className="text-xs text-primary font-bold hover:underline">
                Manage
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {collectionCenters.map((hub) => {
                const stock = hub.currentHoldingsQuintals || hub.currentStock || 0;
                const util = Math.round((stock / hub.capacityQuintals) * 100);
                return (
                  <div key={hub.id} className="rounded-lg border border-border/80 bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{hub.name}</span>
                      <span className="text-[11px] font-medium text-muted-foreground">{hub.district}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stock: <strong>{stock}Q</strong> / {hub.capacityQuintals}Q</span>
                      <span className="font-bold text-foreground">{util}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${util > 80 ? "bg-amber-500" : "bg-primary"}`} 
                        style={{ width: `${util}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smallholder Member Overview */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Top Smallholders</h3>
              </div>
              <Link href="/fpo/members" className="text-xs text-primary font-bold hover:underline">
                Roster
              </Link>
            </div>

            <div className="mt-3 divide-y divide-border">
              {members.slice(0, 4).map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      {m.name}
                      {m.verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{m.village} · {m.crops.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{m.availableQuantity}Q</span>
                    <p className="text-[10px] text-muted-foreground">Avail.</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" asChild size="sm" className="w-full mt-4 text-xs">
              <Link href="/fpo/members">
                Add / Verify Smallholder
              </Link>
            </Button>
          </div>

          {/* Collective Value Proposition Note */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">FPO Collective Bargaining</p>
                <p className="mt-1 text-emerald-800/80 dark:text-emerald-400/90 leading-relaxed">
                  By pooling standard Grade-A lots at collection centers, members receive direct digital escrow payout saving an average of ₹140/Q in middleman deductions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
