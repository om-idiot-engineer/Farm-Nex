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
import { getAgreement, raiseDealDispute, confirmOrderDelivery, confirmOrderPayment, rateOrderTransaction } from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import OrderTimeline from "@/components/OrderTimeline";
import PaymentBreakdown from "@/components/PaymentBreakdown";
import LogisticsPanel from "@/components/LogisticsPanel";

export default function DealRoomPage() {
  const { user, loading, hasAccess } = useRequiredUser(["farmer", "buyer", "fpo", "admin"]);
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "deal-001";

  const [agreement, setAgreement] = useState<ExtendedTradeAgreement | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Moisture percentage variance between field sample and plant gate test");
  const [disputeNote, setDisputeNote] = useState("");
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "negotiation" | "quality" | "logistics" | "payment" | "documents">("overview");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(5450);
  const [counterNote, setCounterNote] = useState("");
  const [negotiationItems, setNegotiationItems] = useState([
    {
      id: "neg-1",
      sender: "Initial Buyer Offer",
      time: "01 Mar 2026, 09:30 AM",
      price: 5200,
      notes: "Mill unloading within 48h, moisture threshold < 12.0%.",
      role: "buyer",
    },
    {
      id: "neg-2",
      sender: "Farmer Counter Offer",
      time: "01 Mar 2026, 11:15 AM",
      price: 5350,
      notes: "Premium Grade A harvest with certified 10.4% moisture assay from Sanwer hub.",
      role: "farmer",
    },
    {
      id: "neg-3",
      sender: "Mutually Accepted Contract Rate",
      time: "01 Mar 2026, 02:40 PM",
      price: 5350,
      notes: "Buyer accepted counter terms. Transporter dispatched for farm-gate collection.",
      role: "system",
    },
  ]);

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
  const tonnes = (qty / 10).toFixed(1);
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
      type: "PDF Contract (142 KB)",
      date: agreement.created_at || "01 Mar 2026",
      verified: true,
      hash: "SHA-256: 7f8a...9c2d",
    },
    {
      id: "DOC-2",
      title: "Certified Electronic Weighbridge Tare & Gross Slip",
      type: "Slip #WB-9821 (88 KB)",
      date: "03 Mar 2026",
      verified: true,
      hash: "Gross: 14,820 kg | Tare: 4,820 kg",
    },
    {
      id: "DOC-3",
      title: "NABL Accredited Moisture & Foreign Matter Lab Certificate",
      type: "Test Report #QC-401 (110 KB)",
      date: "03 Mar 2026",
      verified: true,
      hash: "Moisture: 10.4% | Impurity: 1.1%",
    },
    {
      id: "DOC-4",
      title: "National GST E-Way Bill & Goods Consignment Note",
      type: "E-Way #EWB-8921-99 (95 KB)",
      date: "02 Mar 2026",
      verified: true,
      hash: "Valid till 05 Mar 2026",
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/deals" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Deal #{agreement.orderNumber || agreement.id}
            </h1>
            <StatusBadge status={agreement.status} />
            {agreement.dispute?.hasDispute && (
              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-black uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                Dispute Under Review
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            B2B Commercial Agricultural Trade Agreement · Locked via Digital Contract
          </p>

          <div className="flex flex-wrap gap-2 pt-3">
            {agreement.status === "in_transit" && user?.role === "buyer" && (
              <Button onClick={async () => {
                await confirmOrderDelivery(id);
                window.location.reload();
              }}>Confirm Delivery</Button>
            )}
            {agreement.status === "delivered" && user?.role === "farmer" && (
              <Button onClick={async () => {
                await confirmOrderPayment(id);
                window.location.reload();
              }}>Confirm Payment Received</Button>
            )}
            {agreement.status === "completed" && (
              <div className="flex flex-wrap gap-2 items-center bg-muted/50 p-3 rounded-lg border border-border">
                <span className="text-sm font-bold">Leave Rating:</span>
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border p-1 rounded text-sm bg-card">
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <input
                  type="text"
                  placeholder="Write a review..."
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  className="border p-1 rounded text-sm px-2 bg-card min-w-[200px]"
                />
                <Button size="sm" onClick={async () => {
                  await rateOrderTransaction(id, rating, review);
                  alert("Rating submitted successfully!");
                }}>Submit Rating</Button>
              </div>
            )}
          </div>
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

      {/* DEAL SUMMARY HEADER (Section 13) */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Commercial Trade Summary</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
              {agreement.crop_id}
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            Created: {agreement.created_at || "01 Mar 2026"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Producer / Seller</span>
            <Link
              href={`/profile/${agreement.farmer_id || "demo-farmer-ramesh"}`}
              className="font-bold text-sm text-foreground block mt-0.5 truncate hover:underline hover:text-primary"
            >
              {agreement.farmer_name || "Ramesh Patel"}
            </Link>
            <span className="text-[11px] text-muted-foreground">Sanwer, Indore</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Buyer Entity</span>
            <Link
              href={`/profile/${agreement.buyer_id || "demo-buyer-agrocorp"}`}
              className="font-bold text-sm text-foreground block mt-0.5 truncate hover:underline hover:text-primary"
            >
              {agreement.buyer_name || "ITC Agri Division"}
            </Link>
            <span className="text-[11px] text-muted-foreground">GST Active</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Contract Quantity</span>
            <span className="font-black text-sm text-foreground block mt-0.5">{qty} Quintals</span>
            <span className="text-[11px] text-muted-foreground font-semibold">({tonnes} Metric Tonnes)</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Agreed Rate</span>
            <span className="font-black text-sm text-primary block mt-0.5">₹{rate.toLocaleString("en-IN")}/Q</span>
            <span className="text-[11px] text-muted-foreground">Farm-gate rate</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Total Deal Value</span>
            <span className="font-black text-sm text-emerald-800 block mt-0.5">₹{grossValue.toLocaleString("en-IN")}</span>
            <span className="text-[11px] text-muted-foreground">Protected in Escrow</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Delivery Destination</span>
            <span className="font-bold text-sm text-foreground block mt-0.5 truncate">{agreement.deliveryDestination || "Dewas Agro Mill"}</span>
            <span className="text-[11px] text-muted-foreground">Gate Bay #3</span>
          </div>
        </div>
      </div>

      {/* 6-Stage Milestone Tracker (Section 12) */}
      <OrderTimeline status={agreement.status} />

      {/* WORKSPACE NAVIGATION TABS (Section 13) */}
      <div className="border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "overview", label: "1. Overview & Parties" },
            { id: "negotiation", label: "2. Negotiation History" },
            { id: "quality", label: "3. Quality / Assay" },
            { id: "logistics", label: "4. Logistics & Tracking" },
            { id: "payment", label: "5. Payment & Escrow" },
            { id: "documents", label: "6. Verified Documents (4)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-t-lg font-bold transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
                activeTab === t.id
                  ? "border-primary text-primary bg-primary/5 font-black"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" /> Buyer Entity
                </span>
                <TrustBadge type="buyer" size="sm" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                <Link
                  href={`/profile/${agreement.buyer_id || "demo-buyer-agrocorp"}`}
                  className="hover:underline hover:text-primary"
                >
                  {agreement.buyer_name || "ITC Agri Business Division"}
                </Link>
              </h3>
              <p className="text-xs text-muted-foreground">
                Delivery Destination: <strong className="text-foreground">{agreement.deliveryDestination || "Dewas Extraction Plant"}</strong>
              </p>
              <div className="pt-2 text-xs border-t border-border mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                <div>GSTIN: <strong className="text-foreground">23AAACI1234F1Z5</strong></div>
                <div>Payment Terms: <strong className="text-foreground">Escrow 24h Release</strong></div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-emerald-600" /> Producer Seller
                </span>
                <TrustBadge type="producer" size="sm" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                <Link
                  href={`/profile/${agreement.farmer_id || "demo-farmer-ramesh"}`}
                  className="hover:underline hover:text-primary"
                >
                  {agreement.farmer_name || "Ramesh Patel"}
                </Link>
              </h3>
              <p className="text-xs text-muted-foreground">
                Farm Gate Origin: <strong className="text-foreground">{agreement.pickupLocation || "Sanwer Aggregation Hub, Indore"}</strong>
              </p>
              <div className="pt-2 text-xs border-t border-border mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Farmer KYC: <strong className="text-emerald-700">Aadhaar Verified</strong></div>
                <div>Bank Account: <strong className="text-foreground">SBI Sanwer (Active)</strong></div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Contract Terms</span>
              <p className="font-bold text-sm text-foreground">Firm Delivery Contract</p>
              <p className="text-xs text-muted-foreground">Direct pickup scheduled with zero intermediary deductions.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Escrow Security</span>
              <p className="font-bold text-sm text-emerald-800">100% Funds Secured</p>
              <p className="text-xs text-muted-foreground">Buyer deposited ₹{grossValue.toLocaleString("en-IN")} into trusted bank escrow.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Arbitration Desk</span>
              <p className="font-bold text-sm text-foreground">FarmNex Mandi Guarantee</p>
              <p className="text-xs text-muted-foreground">Impartial electronic slip inspection within 4 hours if disputed.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEGOTIATION */}
      {activeTab === "negotiation" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-black text-foreground">Structured Commercial Negotiation</h3>
              <p className="text-xs text-muted-foreground">
                Digital audit trail of binding counter-proposals with real-time mandi benchmark parity.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold shrink-0">
              Contract Terms Locked
            </span>
          </div>

          {/* ACTIVE OFFER HIGHLIGHT CARD */}
          <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Latest Active Offer
                </span>
                <h4 className="text-lg font-black text-foreground">
                  ₹{rate.toLocaleString("en-IN")}/quintal · {qty} Quintals
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground block">Mandi Benchmark: ₹5,420/q</span>
                <span className="text-xs font-bold text-emerald-800">
                  {rate >= 5420 ? "+₹" + (rate - 5420) + " Premium" : "-₹" + (5420 - rate) + " Discount"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proposed Total</span>
                <span className="font-black text-sm text-foreground">₹{grossValue.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Delivery Point</span>
                <span className="font-bold text-foreground">Dewas Extraction Plant</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Moisture Tolerance</span>
                <span className="font-bold text-foreground">&le; 11.5% Grade A</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Payment Release</span>
                <span className="font-bold text-emerald-800">Escrow 24h Payout</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/15">
              <Button
                size="sm"
                onClick={() => alert("Current terms accepted. Purchase order generated.")}
                className="font-bold text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Accept Terms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCounterOpen(!isCounterOpen)}
                className="font-bold text-xs"
              >
                {isCounterOpen ? "Cancel Counter" : "Make Counter-Offer"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("Decline logged. Counterparty notified.")}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Decline Offer
              </Button>
            </div>

            {/* COUNTER-OFFER DRAWER */}
            {isCounterOpen && (
              <div className="mt-3 p-4 bg-card border border-border rounded-xl space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Submit Revised Proposal
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Counter Price (₹ per Quintal)
                    </label>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-black"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Terms / Justification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grade A assay certificate attached, firm 24h pickup"
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setNegotiationItems([
                        ...negotiationItems,
                        {
                          id: `neg-${Date.now()}`,
                          sender: user?.role === "farmer" ? "Farmer Revised Counter" : "Buyer Revised Counter",
                          time: "Just now",
                          price: counterPrice,
                          notes: counterNote || "Revised rate proposed based on mandi spot rates.",
                          role: user?.role || "farmer",
                        },
                      ]);
                      setIsCounterOpen(false);
                      setCounterNote("");
                    }}
                    className="font-bold text-xs"
                  >
                    Submit Counter-Proposal
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* NEGOTIATION AUDIT TRAIL */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Negotiation Audit Log ({negotiationItems.length} Events)
            </h4>
            {negotiationItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border bg-muted/15 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-primary uppercase tracking-wider text-[10px]">
                    {item.sender}
                  </span>
                  <span className="text-muted-foreground text-[11px]">{item.time}</span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  ₹{item.price.toLocaleString("en-IN")}/quintal
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY / ASSAY */}
      {activeTab === "quality" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-black text-foreground">Certified Quality Assay & Laboratory Test</h3>
              <p className="text-xs text-muted-foreground">
                NABL Accredited test specifications compared against processor procurement benchmark.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
              Grade A · Meets Mill Specs
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Moisture Level</span>
              <p className="text-lg font-black text-emerald-800">10.4%</p>
              <p className="text-muted-foreground text-[11px]">Benchmark: &le; 12.0% (Safe for storage)</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Foreign Matter</span>
              <p className="text-lg font-black text-foreground">1.1%</p>
              <p className="text-muted-foreground text-[11px]">Allowable: &le; 2.0%</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Oil / Protein Content</span>
              <p className="text-lg font-black text-primary">19.2%</p>
              <p className="text-muted-foreground text-[11px]">Industry Standard: 18.0%</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Damaged / Weeviled Grain</span>
              <p className="text-lg font-black text-foreground">0.6%</p>
              <p className="text-muted-foreground text-[11px]">Allowable: &le; 3.0%</p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-2 text-xs">
            <h4 className="font-bold text-foreground">Weighbridge Assay Verification</h4>
            <div className="grid sm:grid-cols-3 gap-3 text-muted-foreground pt-1">
              <div>Tare Weight: <strong className="text-foreground">4,820 kg</strong></div>
              <div>Gross Weight: <strong className="text-foreground">14,820 kg</strong></div>
              <div>Net Produce Weight: <strong className="text-foreground">10,000 kg (100 Quintals)</strong></div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
              Recorded at Sanwer Digital Electronic Weighbridge #9821. Zero tare variance detected.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: LOGISTICS */}
      {activeTab === "logistics" && (
        <div className="space-y-6">
          <LogisticsPanel agreement={agreement} />
        </div>
      )}

      {/* TAB 5: PAYMENT & ESCROW */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          <PaymentBreakdown
            breakdown={mockBreakdown}
            quantityQuintals={qty}
            ratePerQuintal={rate}
          />
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === "documents" && (
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
                    <p className="text-[10px] text-primary/80 font-mono mt-0.5">{doc.hash}</p>
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
      )}

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
