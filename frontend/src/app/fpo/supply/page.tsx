"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Layers3, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  Building2
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFpoSupply, createFpoSupplyLot, getFpoCollectionCenters } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

export default function FpoSupplyPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const [supplyLots, setSupplyLots] = useState(() => getFpoSupply().data);
  const [collectionCenters] = useState(() => getFpoCollectionCenters().data);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [crop, setCrop] = useState("Soybean (Yellow JS-335)");
  const [quantity, setQuantity] = useState("400");
  const [quality, setQuality] = useState("Grade-A (Cleaned & Graded)");
  const [moisture, setMoisture] = useState("10.8%");
  const [membersCount, setMembersCount] = useState("14");
  const [collectionCenter, setCollectionCenter] = useState(collectionCenters[0]?.name || "Sanwer Aggregation Hub");
  const [availableDate, setAvailableDate] = useState("Tomorrow");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="card" />;
  }

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createFpoSupplyLot({
      crop,
      quantity: parseInt(quantity) || 100,
      quality,
      moisture,
      members: parseInt(membersCount) || 5,
      collectionCenter,
      availableDate,
      status: "pooled",
    });

    setSupplyLots([res.data, ...supplyLots]);
    setIsCreateOpen(false);
  };

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
            Pooled Supply Lots
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Standardize multiple member produce yields into uniform commercial batches with single-truckload volume and certified moisture test records.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary text-primary-foreground">
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Create Pooled Batch
        </Button>
      </div>

      <DemoNotice>
        Pooled batches aggregate member stocks and make them immediately visible to bulk buyers on the national procurement marketplace.
      </DemoNotice>

      {/* Grid of Supply Lots */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {supplyLots.map((lot) => (
          <div key={lot.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Lot #{lot.id}
                  </span>
                  <h3 className="mt-1 text-xl font-black text-foreground">
                    {lot.quantity} Quintals
                  </h3>
                  <p className="text-sm font-semibold text-foreground/90">{lot.crop}</p>
                </div>
                <StatusBadge status={lot.status === "pooled" ? "ready" : "in_negotiation"} />
              </div>

              <div className="mt-4 space-y-2 rounded-lg bg-muted/40 p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Grade:</span>
                  <span className="font-bold text-foreground">{lot.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moisture Content:</span>
                  <span className="font-bold text-foreground">{lot.moisture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Smallholders:</span>
                  <span className="font-bold text-foreground">{lot.members} Farmers</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> Hub:
                  </span>
                  <span className="font-semibold text-foreground">{lot.collectionCenter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Dispatch Ready:
                  </span>
                  <span className="font-semibold text-foreground">{lot.availableDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 pt-3 border-t border-border">
              <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                <Link href="/fpo/requirements">
                  Match Buyers
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground text-xs">
                <Link href="/fpo/logistics">
                  Dispatch Plan
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Pool Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Pool Member Supply Batch</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Commodity & Variety</label>
                <input
                  type="text"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Total Batch Quantity (Q)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Participating Members</label>
                  <input
                    type="number"
                    required
                    value={membersCount}
                    onChange={(e) => setMembersCount(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Quality Grade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Grade-A (Cleaned & Graded)">Grade-A (Cleaned & Graded)</option>
                    <option value="Grade-B (Standard Commercial)">Grade-B (Standard Commercial)</option>
                    <option value="Organic Certified">Organic Certified</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Measured Moisture (%)</label>
                  <input
                    type="text"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Assigned Aggregation Center</label>
                <select
                  value={collectionCenter}
                  onChange={(e) => setCollectionCenter(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {collectionCenters.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Availability Readiness</label>
                <input
                  type="text"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Immediate / Next 48 hours"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Publish Pooled Batch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
