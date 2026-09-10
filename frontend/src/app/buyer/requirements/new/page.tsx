"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Scale,
  DollarSign,
  FileText,
  Check,
  PlusCircle,
  Eye
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { createProcurementRfq } from "@/lib/services/domain";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function NewBuyerRequirementPage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["buyer", "consumer", "admin"]);
  const [step, setStep] = useState<number>(1);

  // Form State
  const [crop, setCrop] = useState("Soybean (Yellow JS-335)");
  const [quantity, setQuantity] = useState<number>(250);
  const [qualityGrade, setQualityGrade] = useState("Grade A");
  const [maxMoisture, setMaxMoisture] = useState<number>(11.0);
  const [targetPrice, setTargetPrice] = useState<number>(4850);
  const [paymentTerms, setPaymentTerms] = useState("100% Escrow on Gate-In Weighbridge Tare");
  const [requiredDate, setRequiredDate] = useState("2026-09-25");
  const [destination, setDestination] = useState("Dewas Industrial Processing Facility (Bay #3)");
  const [specNotes, setSpecNotes] = useState("Grain purity > 98%, no field infestation. Certified electronic weighbridge slips required.");

  const [submitting, setSubmitting] = useState(false);

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const grossBudget = (quantity || 0) * (targetPrice || 0);

  const handleSubmit = (publishStatus: "Broadcast" | "Draft" = "Broadcast") => {
    setSubmitting(true);
    try {
      createProcurementRfq({
        crop_id: crop,
        quantityQuintals: Number(quantity),
        targetPricePerQuintal: Number(targetPrice),
        maxMoisturePercentage: Number(maxMoisture),
        deliveryDestination: destination,
        deadline: requiredDate,
        status: publishStatus,
        notes: specNotes,
      });
      router.push("/buyer/requirements");
    } catch (err) {
      alert("Failed to create requirement RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 theme-buyer pb-16">

      {/* Header */}
      <div className="space-y-2 border-b border-border pb-5">
        <Link
          href="/buyer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyer Center
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Publish Sourcing RFQ
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Define your grain specifications, target price ceiling, delivery facility, and quote deadline.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-between pt-3">
          {[
            { num: 1, label: "Crop & Volume" },
            { num: 2, label: "Quality & Specs" },
            { num: 3, label: "Price & Terms" },
            { num: 4, label: "Facility & Date" },
            { num: 5, label: "Preview & Publish" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : step > s.num
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">

        {/* STEP 1: CROP & VOLUME */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-foreground">Step 1: Select Agricultural Crop & Volume</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specify the commodity variety and required metric lot tonnage.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1.5">Commodity Variety</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="Soybean (Yellow JS-335)">Soybean (Yellow JS-335)</option>
                  <option value="Soybean (Organic Grade A)">Soybean (Organic Certified)</option>
                  <option value="Wheat (Sharbati Gold)">Wheat (Sharbati Gold)</option>
                  <option value="Wheat (Lokwan Premium)">Wheat (Lokwan Premium)</option>
                  <option value="Cotton (Medium Staple)">Cotton (Medium Staple)</option>
                  <option value="Mustard (High Oil)">Mustard (High Oil Content)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">Required Quantity (Quintals)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={10}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Equivalent to {(quantity / 10).toFixed(1)} Metric Tonnes
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={() => setStep(2)} className="font-bold text-xs h-10 px-5">
                Continue to Quality Specs <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: QUALITY SPECS */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-foreground">Step 2: Quality Benchmark & Assay Thresholds</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Establish laboratory assay acceptance limits for moisture and impurity.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-foreground block mb-1.5">Target Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="Grade A">Grade A (Processor Benchmark)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Export Quality">Export Grade</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1.5">Max Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxMoisture}
                    onChange={(e) => setMaxMoisture(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">Standard threshold &lt; 12%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">Detailed Quality Notes & Requirements</label>
                <textarea
                  rows={3}
                  value={specNotes}
                  onChange={(e) => setSpecNotes(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(1)} className="font-bold text-xs h-10">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="font-bold text-xs h-10 px-5">
                Continue to Price & Terms <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PRICE & PAYMENT TERMS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-foreground">Step 3: Target Buying Price & Payment Terms</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transparent commercial rates and escrow guarantees for matched growers.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1.5">Target Buying Price (₹/Quintal)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-[11px] text-primary font-bold mt-1 block">
                  Total Allocated Budget: ₹{grossBudget.toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">Payment Terms & Settlement</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="100% Escrow on Gate-In Weighbridge Tare">100% Escrow on Gate-In Weighbridge Tare (Recommended)</option>
                  <option value="Instant RTGS within 24h of Assay Approval">Instant RTGS within 24h of Assay Approval</option>
                  <option value="50% Advance on Loading + 50% on Delivery">50% Advance on Loading + 50% on Delivery</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(2)} className="font-bold text-xs h-10">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="font-bold text-xs h-10 px-5">
                Continue to Delivery Facility <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: FACILITY & DATE */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-foreground">Step 4: Delivery Destination & Quote Deadline</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select your processing mill gate and bidding cut-off date.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1.5">Processing Facility Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">Quote Submission Deadline</label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(3)} className="font-bold text-xs h-10">
                Back
              </Button>
              <Button onClick={() => setStep(5)} className="font-bold text-xs h-10 px-5">
                Generate Preview <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: PREVIEW REQUIREMENT (Section 29) */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-black uppercase">
                <Eye className="h-3.5 w-3.5" />
                <span>Step 5: Review & Publish</span>
              </div>
              <h2 className="text-xl font-black text-foreground mt-1">Live Sourcing RFQ Preview</h2>
              <p className="text-xs text-muted-foreground">
                This is how verified growers and FPOs in the Malwa region will view your procurement tender.
              </p>
            </div>

            {/* PREVIEW CARD */}
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Procurement Tender Preview
                  </span>
                  <h3 className="text-xl font-black text-foreground mt-0.5">
                    {quantity} Quintals {crop}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span>Destination: {destination}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                  Target: ₹{targetPrice.toLocaleString("en-IN")}/Q
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 border border-border/60 rounded-xl p-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Grade</span>
                  <span className="font-bold text-foreground">{qualityGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Moisture Limit</span>
                  <span className="font-bold text-foreground">&lt; {maxMoisture}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Deadline</span>
                  <span className="font-bold text-foreground">{requiredDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Budget</span>
                  <span className="font-black text-emerald-800">₹{grossBudget.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/10 p-3 rounded-lg border border-border/40">
                <span className="font-bold text-foreground block mb-0.5">Quality & Handling Specifications:</span>
                {specNotes}
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Payment Terms: <strong>{paymentTerms}</strong></span>
              </div>
            </div>

            {/* Actions: Save Draft & Publish Requirement */}
            <div className="flex items-center justify-between pt-4 border-t border-border gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="font-bold text-xs h-10">
                Back to Edit
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("Draft")}
                  disabled={submitting}
                  className="font-bold text-xs h-10"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSubmit("Broadcast")}
                  disabled={submitting}
                  className="font-black text-xs h-10 px-6 shadow-sm"
                >
                  {submitting ? "Broadcasting..." : "Publish Requirement"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
