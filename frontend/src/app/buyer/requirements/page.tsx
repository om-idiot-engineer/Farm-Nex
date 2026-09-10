"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Users, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  DollarSign
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getProcurementRequirements, createProcurementRfq } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";

const LIFECYCLE_STAGES = [
  "All",
  "broadcast",
  "in_negotiation",
  "contracted",
  "fulfilled"
] as const;

export default function BuyerProcurementManagerPage() {
  const { user, loading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const [rfqs, setRfqs] = useState(() => getProcurementRequirements().data);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal form state
  const [crop_id, setCropId] = useState("Soybean (Yellow JS-335)");
  const [quantity, setQuantity] = useState("600");
  const [targetPrice, setTargetPrice] = useState("5380");
  const [moisture, setMoisture] = useState("10.5");
  const [destination, setDestination] = useState("Dewas Industrial Processing Facility");
  const [deadline, setDeadline] = useState("Within 5 days");
  const [notes, setNotes] = useState("Requires grain purity >98%. Delivery via 25T-40T multi-axle trucks.");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createProcurementRfq({
      crop_id: crop_id,
      quantityQuintals: parseInt(quantity) || 100,
      targetPricePerQuintal: parseInt(targetPrice) || 5000,
      maxMoisturePercentage: parseFloat(moisture) || 11,
      deliveryDestination: destination,
      deadline,
      status: "Broadcast",
      notes,
    });

    setRfqs([res.data, ...rfqs]);
    setIsCreateOpen(false);
  };

  const filteredRfqs = rfqs.filter((r) => {
    const matchesTab = activeTab === "All" || r.status.toLowerCase() === activeTab.toLowerCase();
    const crop_idStr = r.crop_id || r.crop || "";
    const destinationStr = r.deliveryDestination || r.destination || "";
    const matchesSearch = crop_idStr.toLowerCase().includes(search.toLowerCase()) ||
      destinationStr.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/buyer" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyer Center
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Procurement RFQ Sourcing Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your institutional tenders across the 8-stage procurement lifecycle: Draft → Broadcast → Quotes → Shortlist → Negotiation → Contract → Weighbridge → Settlement.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary text-primary-foreground">
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Publish Sourcing RFQ
        </Button>
      </div>

      <DemoNotice>
        Broadcasted RFQs trigger algorithmic supplier notifications to local FPOs and verified growers matching your grain parameters.
      </DemoNotice>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 border-b border-border sm:border-0">
          {LIFECYCLE_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveTab(stage)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === stage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {stage === "All" ? "All Stages" : stage.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by crop_id or plant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* RFQs List */}
      <div className="space-y-4">
        {filteredRfqs.map((rfq) => (
          <div key={rfq.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    RFQ #{rfq.id}
                  </span>
                  <StatusBadge status={rfq.status} />
                  <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Target: ₹{(rfq.targetPricePerQuintal || 5200).toLocaleString("en-IN")}/Q
                  </span>
                </div>

                <h2 className="text-xl font-black text-foreground">
                  {(rfq.quantityQuintals || rfq.quantity).toLocaleString("en-IN")} Quintals {rfq.crop_id || rfq.crop}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Destination: <strong className="text-foreground">{rfq.deliveryDestination || rfq.destination}</strong></span>
                  <span>•</span>
                  <span>Max Moisture: <strong className="text-foreground">{rfq.maxMoisturePercentage || 12}%</strong></span>
                  <span>•</span>
                  <span>Quote Deadline: <strong className="text-foreground">{rfq.deadline || rfq.neededBy}</strong></span>
                </div>

                {rfq.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    Specifications: {rfq.notes}
                  </p>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-base font-black text-foreground">{rfq.responseCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Quotes In</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-600">{rfq.matchedSuppliers?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Matched</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                    <Link href={`/buyer/requirements/${rfq.id}`}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Sourcing Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
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

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">CropId & Target Variety</label>
                <input
                  type="text"
                  required
                  value={crop_id}
                  onChange={(e) => setCropId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-xs font-bold text-foreground">Target Price (₹/Quintal)</label>
                  <input
                    type="number"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Max Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Quote Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Delivery Destination Processing Plant</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Specifications & Delivery Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Publish RFQ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
