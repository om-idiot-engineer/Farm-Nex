"use client";

import React from "react";
import Link from "next/link";
import { 
  FileCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Truck, 
  DollarSign, 
  Download,
  Building2,
  FileText,
  ShieldCheck
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";

export default function BuyerDealsPage() {
  const { user, loading, hasAccess } = useRequiredUser(["buyer", "admin"]);

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const contracts = [
    {
      id: "CTR-2026-089",
      sellerName: "Malwa Kisan Samriddhi FPC",
      sellerRole: "fpo",
      crop: "Soybean (JS-335 Grade A)",
      quantity: 500,
      agreedRate: 5320,
      totalAmount: 2660000,
      escrowStatus: "100% Escrow Funded",
      destination: "Dewas Processing Plant",
      dispatchStatus: "in_transit",
      carrier: "Express Agri Freight (MP-09-GH-4412)",
      weighbridgeSlip: "Pending Tare Weigh-in",
      moistureReport: "10.6% (Approved)",
    },
    {
      id: "CTR-2026-062",
      sellerName: "Ramesh Patel",
      sellerRole: "producer",
      crop: "Wheat (Sharbati Milling Grade)",
      quantity: 250,
      agreedRate: 3200,
      totalAmount: 800000,
      escrowStatus: "Disbursed to Farmer",
      destination: "Pithampur Silo #4",
      dispatchStatus: "delivered",
      carrier: "Kisan Logistics (MP-09-AB-1234)",
      weighbridgeSlip: "Slip #WB-9821 Verified",
      moistureReport: "10.8% (Approved)",
    }
  ];

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
            Procurement Contracts & Settlement
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor institutional trade agreements, digital escrow releases, electronic weighbridge verification, and quality acceptance certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/orders">
              View All Order Shipments
            </Link>
          </Button>
        </div>
      </div>

      <DemoNotice>
        Escrow funds are automatically transferred to the seller once your plant gate weighbridge operator verifies the physical tare weight.
      </DemoNotice>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Contract #{c.id}
                  </span>
                  <StatusBadge status={c.dispatchStatus} />
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {c.escrowStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    {c.quantity}Q {c.crop}
                  </h2>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm font-semibold text-foreground">from {c.sellerName}</span>
                  <TrustBadge type={c.sellerRole === "fpo" ? "fpo" : "producer"} size="sm" />
                </div>

                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Agreed Rate:</span>
                    <p className="font-bold text-foreground">₹{c.agreedRate.toLocaleString("en-IN")}/Q</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <p className="font-bold text-foreground">₹{c.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Plant:</span>
                    <p className="font-semibold text-foreground truncate">{c.destination}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Moisture Spec:</span>
                    <p className="font-semibold text-foreground">{c.moistureReport}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-primary" /> {c.carrier}
                  </span>
                  <span>•</span>
                  <span>Weighbridge Status: <strong className="text-foreground">{c.weighbridgeSlip}</strong></span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 shrink-0 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href={`/messages?recipientId=demo-farmer&subject=Contract ${c.id} Inquiry`}>
                    Message Supplier
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                  <Link href={`/orders/ord-${c.id.toLowerCase()}`}>
                    Inspect Order Workspace <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
