"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Truck, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText,
  ShieldCheck,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFpoCollectionCenters, getFpoLogistics } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LogisticsPanel from "@/components/LogisticsPanel";

export default function FpoLogisticsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const centersResult = getFpoCollectionCenters();
  const batchesResult = getFpoLogistics();

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const centers = centersResult.data;
  const batches = batchesResult.data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/fpo" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to FPO Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Collection Centers & Transport Logistics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor village-level aggregation hubs, weighing equipment, and scheduled multi-ton commercial transport dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/fpo/supply">
              Schedule Dispatch Batch
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Collection center weights and moisture metrics are synchronized with digital trade escrow contracts upon weighbridge receipt upload.
      </DemoNotice>

      {/* Collection Centers */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Village Aggregation Hubs
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {centers.map((center) => {
            const stock = center.currentHoldingsQuintals || center.currentStock || 0;
            const utilization = Math.round((stock / center.capacityQuintals) * 100);
            return (
              <div key={center.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{center.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {center.district}
                    </p>
                  </div>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {utilization}% Capacity
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Stored Stock: <strong>{stock}Q</strong></span>
                    <span>Max Capacity: <strong>{center.capacityQuintals}Q</strong></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${utilization > 80 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-muted-foreground">
                    <span>Supervisor: <strong>{center.contactPerson}</strong></span>
                    <span className="block text-[11px]">{center.contactPhone || center.phone}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Certified Weighbridge Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatches & Logistics Batches */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Commercial Dispatch Batches
        </h2>

        <div className="space-y-3">
          {batches.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Batch #{b.id}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${b.status === "in_transit" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1">
                    {b.quantity}Q {b.crop} → {b.destination}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Carrier: <strong>{b.transporter}</strong></span>
                    <span>•</span>
                    <span>Vehicle: <strong>{b.vehicleNumber}</strong></span>
                    <span>•</span>
                    <span>Driver: <strong>{b.driverName} ({b.driverPhone})</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-border pt-3 md:border-t-0 md:pt-0">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href={`/orders/ord-${b.id.toLowerCase()}`}>
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> E-Way Bill & Proofs
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Data Notice */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-bold text-foreground">Verified Milestone-Based Transport Tracking</p>
            <p className="mt-0.5 leading-relaxed">
              Farm-Nex logistics tracking relies on verified physical handover checkpoints: weighbridge gross slips, driver physical receipt confirmation, and buyer destination tare weigh-in rather than battery-draining mock GPS simulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
