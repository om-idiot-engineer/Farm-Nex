"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  X
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAgreement, raiseDealDispute } from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import OrderTimeline from "@/components/OrderTimeline";
import PaymentBreakdown from "@/components/PaymentBreakdown";
import LogisticsPanel from "@/components/LogisticsPanel";

export default function OrderTransactionWorkspacePage() {
  const { user, loading, hasAccess } = useRequiredUser(["farmer", "buyer", "fpo", "admin"]);
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "deal-001";

  const [agreement, setAgreement] = useState<ExtendedTradeAgreement | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Moisture percentage variance between field sample and plant gate test");
  const [disputeNote, setDisputeNote] = useState("");
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    if (!user || !hasAccess) return;
    async function load() {
      try {
        const res = await getAgreement(id);
        setAgreement(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [hasAccess, id, user]);

  if (loading || !user || !hasAccess || loadingData || !agreement) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await raiseDealDispute(agreement.id, `${disputeReason}: ${disputeNote}`);
      setAgreement(res.data);
      setDisputeSuccess(true);
      setIsDisputeOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const qty = agreement.quantity || agreement.agreed_quantity || 100;
  const rate = agreement.price_per_quintal || agreement.agreed_price || 5000;
  const grossValue = qty * rate;
  const freightTotal = Math.round(qty * 65);
  const platformFee = Math.round(grossValue * 0.01);
  const netRealized = grossValue - freightTotal - platformFee;

  const mockBreakdown = {
    gross_produce_value: grossValue,
    logistics_cost_deduction: freightTotal,
    platform_fee: platformFee,
    net_farmer_earnings: netRealized,
  };

  const dealDocuments = [
    {
      id: "DOC-1",
      title: "Legally Binding Agricultural Purchase Agreement",
      type: "PDF Document (142 KB)",
      date: agreement.created_at || "01 Mar 2026",
      verified: true,
    },
    {
      id: "DOC-2",
      title: "Certified Electronic Weighbridge Tare & Gross Slip",
      type: "Slip #WB-9821 (88 KB)",
      date: "03 Mar 2026",
      verified: true,
    },
    {
      id: "DOC-3",
      title: "NABL Accredited Moisture & Foreign Matter Lab Certificate",
      type: "Test Report #QC-401 (110 KB)",
      date: "03 Mar 2026",
      verified: true,
    },
    {
      id: "DOC-4",
      title: "National GST E-Way Bill & Goods Consignment Note",
      type: "E-Way #EWB-8921-99 (95 KB)",
      date: "02 Mar 2026",
      verified: true,
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/orders" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Order #{agreement.orderNumber || agreement.id}
            </h1>
            <StatusBadge status={agreement.status} />
            {agreement.dispute?.hasDispute && (
              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-black uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                Dispute Under Review
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Contracted Trade: <strong className="text-foreground">{qty}Q {agreement.commodity}</strong> at ₹{rate.toLocaleString("en-IN")}/Q
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="text-xs"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Agreement
          </Button>

          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href={`/messages?recipientId=${user.role === "buyer" ? (agreement.farmer_id || "demo-farmer") : (agreement.buyer_id || "demo-buyer")}&subject=Order ${agreement.orderNumber || agreement.id} Inquiry`}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Counterparty Chat
            </Link>
          </Button>

          {!agreement.dispute?.hasDispute && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDisputeOpen(true)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Raise Dispute
            </Button>
          )}
        </div>
      </div>

      <DemoNotice>
        Transaction workspace demonstrates live milestone progression, transparent financial deductions, and physical document verification.
      </DemoNotice>

      {/* Counterparty Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Buyer Info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-blue-600" /> Buyer Entity
            </span>
            <TrustBadge type="buyer" size="sm" />
          </div>
          <h3 className="text-base font-bold text-foreground">{agreement.buyer_name || "ITC Agri Business Division"}</h3>
          <p className="text-xs text-muted-foreground">
            Delivery Destination: <strong className="text-foreground">{agreement.deliveryDestination || "Dewas Extraction Plant"}</strong>
          </p>
        </div>

        {/* Seller Info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-emerald-600" /> Producer Seller
            </span>
            <TrustBadge type="producer" size="sm" />
          </div>
          <h3 className="text-base font-bold text-foreground">{agreement.farmer_name || "Ramesh Patel"}</h3>
          <p className="text-xs text-muted-foreground">
            Farm Gate Origin: <strong className="text-foreground">{agreement.pickupLocation || "Sanwer Aggregation Hub, Indore"}</strong>
          </p>
        </div>
      </div>

      {/* 8-Stage Milestone Tracker */}
      <OrderTimeline status={agreement.status} />

      {/* Split Grid: Logistics & Settlement */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LogisticsPanel agreement={agreement} />
        <PaymentBreakdown 
          breakdown={mockBreakdown}
          quantityQuintals={qty}
          ratePerQuintal={rate}
        />
      </div>

      {/* Verified Deal Documents Repository */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Verified Deal Documents & Compliance Proofs</h3>
            <p className="text-xs text-muted-foreground">Immutable records required for digital escrow disbursement</p>
          </div>
          <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            All 4 Documents Stamped
          </span>
        </div>

        <div className="divide-y divide-border">
          {dealDocuments.map((doc) => (
            <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{doc.title}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.type} · Generated {doc.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => alert(`Simulating download of ${doc.title}`)}
                  className="text-xs h-7"
                >
                  <Download className="mr-1 h-3 w-3" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raise Dispute Dialog */}
      {isDisputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-bold text-foreground">Raise Commercial Dispute</h3>
              </div>
              <button 
                onClick={() => setIsDisputeOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Moisture percentage variance between field sample and plant gate test">
                    Moisture % variance (field vs factory)
                  </option>
                  <option value="Weighbridge net weight discrepancy greater than allowable 0.5% tolerance">
                    Weighbridge tare/gross weight discrepancy
                  </option>
                  <option value="Severe foreign matter or damaged kernel percentage exceeding contract specs">
                    Foreign matter / grain quality defect
                  </option>
                  <option value="Transporter transit delay exceeding 48 hours causing demurrage">
                    Transit delay causing demurrage
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Detailed Explanation & Claim Evidence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reference weighbridge slip numbers, lab test batch numbers, and exact variance..."
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="rounded-lg bg-rose-50/50 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                <p className="font-bold">Escrow Freeze Notice:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Raising this dispute places the contested escrow amount on hold until our impartial legal arbitration desk reviews the electronic slips.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDisputeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                  File Dispute & Hold Escrow
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
