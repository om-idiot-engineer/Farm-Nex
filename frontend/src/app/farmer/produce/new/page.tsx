"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sprout,
  Calendar,
  Building2,
  DollarSign,
  Scale,
  Award,
  HelpCircle,
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { createListing } from "@/lib/services/domain";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

export default function NewProduceListingPage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [step, setStep] = useState<number>(1);

  // Form State
  const [commodity, setCommodity] = useState<"soybean" | "wheat" | "cotton">("soybean");
  const [quantity, setQuantity] = useState<number>(200);
  const [unit, setUnit] = useState<string>("Quintals");
  const [qualityGrade, setQualityGrade] = useState<string>("Grade A");
  const [moisture, setMoisture] = useState<number | "">(11.2);
  const [harvestDate, setHarvestDate] = useState<string>("2026-08-28");
  const [notes, setNotes] = useState<string>("Cleaned and stored on wooden pallets. Moisture tested in morning sample.");
  
  // Storage Location
  const [locationType, setLocationType] = useState<"farm_gate" | "mandi" | "warehouse" | "fpo">("farm_gate");
  const [location, setLocation] = useState<string>("Sanwer, Indore, Madhya Pradesh");
  const [lat, setLat] = useState<number>(22.7196);
  const [lng, setLng] = useState<number>(75.8577);

  // Availability & Logistics
  const [availability, setAvailability] = useState<"today" | "tomorrow" | "this_week" | "custom">("this_week");
  const [pickupPreference, setPickupPreference] = useState<string>("Buyer pickup");
  const [expectedPrice, setExpectedPrice] = useState<number>(5300);

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !hasAccess) return;
    if (user.farmer_profile?.location) {
      setLocation(user.farmer_profile.location);
      if (user.farmer_profile.lat) setLat(user.farmer_profile.lat);
      if (user.farmer_profile.lng) setLng(user.farmer_profile.lng);
    }
  }, [hasAccess, user]);

  const benchmarkRates = {
    soybean: 5420,
    wheat: 2385,
    cotton: 7160,
  };

  const currentBenchmark = benchmarkRates[commodity];
  const grossEstimatedValue = quantity * (expectedPrice || currentBenchmark);
  const estimatedFreightPerQ = 82;
  const estimatedNetRealizationPerQ = (expectedPrice || currentBenchmark) - estimatedFreightPerQ - 35;
  const potentialTotalNet = quantity * estimatedNetRealizationPerQ;

  // Auto-detect with explicit user permission
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocation(`Geotagged Farm Gate (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => alert("Location permission denied or unavailable.")
      );
    }
  };

  // Step validation
  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!quantity || quantity <= 0) newErrors.quantity = "Please specify a quantity greater than zero.";
    }
    if (s === 2) {
      if (moisture !== "" && (moisture < 5 || moisture > 35)) {
        newErrors.moisture = "Moisture percentage typically ranges between 8% and 25%.";
      }
      if (!harvestDate) newErrors.harvestDate = "Please provide the harvest date.";
      if (!location.trim()) newErrors.location = "Please enter the village, tehsil, or mandi location.";
    }
    if (s === 3) {
      if (!expectedPrice || expectedPrice <= 0) newErrors.expectedPrice = "Please set a positive asking price.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(3, prev + 1));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !user) return;
    setSubmitting(true);
    try {
      const res = await createListing(
        {
          commodity,
          quantity: Number(quantity),
          quality_grade: qualityGrade,
          moisture_percent: moisture === "" ? null : Number(moisture),
          harvest_date: harvestDate,
          availability_date: new Date().toISOString().split("T")[0],
          location,
          lat,
          lng,
          expected_price: Number(expectedPrice),
          pickup_preference: pickupPreference,
          payment_preference: "Within 2 days",
        },
        user
      );
      router.push(`/farmer/buyers?listing_id=${res.data.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to publish listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Step Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground p-0 hover:bg-transparent">
            <Link href="/farmer">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Dashboard
            </Link>
          </Button>
          <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">List Harvested Produce</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Connect directly with verified processors and calculate your farm-gate payout.
          </p>
        </div>

        {/* 3 Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { stepNum: 1, title: "1. Commodity & Volume" },
            { stepNum: 2, title: "2. Quality & Origin" },
            { stepNum: 3, title: "3. Target Realization" },
          ].map((item) => (
            <div key={item.stepNum} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  item.stepNum <= step ? "bg-primary" : "bg-muted"
                }`}
              />
              <span className="text-[11px] font-bold text-muted-foreground block truncate">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP CONTAINER */}
      <div className="border border-border bg-card rounded-xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* STEP 1: COMMODITY & VOLUME */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <h2 className="text-lg font-black text-foreground">Select Commodity & Quantity</h2>
              <p className="text-xs text-muted-foreground">Choose what you harvested and enter your available volume.</p>
            </div>

            {/* Commodity Selector */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "soybean", label: "Soybean", benchmark: "₹5,420/q", desc: "Yellow seeded oilseed" },
                { id: "wheat", label: "Wheat", benchmark: "₹2,385/q", desc: "Sharbati / Lokwan milling" },
                { id: "cotton", label: "Cotton", benchmark: "₹7,160/q", desc: "Medium/long staple kapas" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCommodity(c.id as any)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between space-y-2 ${
                    commodity === c.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                      <Sprout className="h-4 w-4" />
                    </span>
                    {commodity === c.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-foreground">{c.label}</h3>
                    <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-border/80 text-xs">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Mandi Benchmark</span>
                    <span className="font-black text-primary">{c.benchmark}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Quantity Input with Live Benchmark Value */}
            <div className="grid sm:grid-cols-2 gap-4 items-center pt-2 border-t border-border">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Available Quantity (Quintals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xl font-black p-3 border border-input rounded-lg bg-background outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-3.5 text-xs font-bold text-muted-foreground">
                    Quintals (100 kg/Q)
                  </span>
                </div>
                {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
              </div>

              <div className="border border-primary/25 bg-primary/5 rounded-xl p-4 text-left space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Gross Benchmark Value
                </span>
                <p className="text-2xl font-black text-foreground">
                  ₹{(quantity * currentBenchmark).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ₹{currentBenchmark}/q benchmark across MP mandis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: QUALITY & FARM-GATE ORIGIN */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <h2 className="text-lg font-black text-foreground">Quality Assays & Pickup Location</h2>
              <p className="text-xs text-muted-foreground">Accurate parameters ensure prompt counterparty matching without weighbridge rejections.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full p-2.5 text-sm border border-input rounded-lg bg-background font-medium"
                >
                  <option value="Grade A">Grade A (Premium - Uniform, High Oil / Protein)</option>
                  <option value="Grade B">Grade B (Standard Commercial Milling)</option>
                  <option value="Grade C">Grade C (Industrial Crushing)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Moisture Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 11.2"
                  className="w-full p-2.5 text-sm border border-input rounded-lg bg-background font-bold outline-none focus:border-primary"
                />
                {errors.moisture && <p className="text-xs text-rose-600 mt-1">{errors.moisture}</p>}
                <p className="text-[11px] text-muted-foreground mt-0.5">Recommended moisture: 10.5%–12.0%</p>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full p-2.5 text-sm border border-input rounded-lg bg-background font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Storage Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleaned and stored on wooden pallets"
                  className="w-full p-2.5 text-sm border border-input rounded-lg bg-background text-xs"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Pickup Location / Farm Gate Address
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  className="text-xs h-7"
                >
                  <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                  Auto-Detect GPS
                </Button>
              </div>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sanwer, Indore, Madhya Pradesh"
                className="w-full p-2.5 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
              />
              {errors.location && <p className="text-xs text-rose-600">{errors.location}</p>}

              {/* Pickup Preference */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Pickup Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "Buyer pickup", label: "Buyer Pickup at Farm Gate", desc: "Buyer arranges commercial truck" },
                    { id: "Farmer delivery", label: "Farmer Delivery to Mill", desc: "Farmer arranges dispatch" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPickupPreference(p.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        pickupPreference === p.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <span className="font-bold text-xs text-foreground block">{p.label}</span>
                      <span className="text-[11px] text-muted-foreground block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TARGET PRICE & ESTIMATED NET REALIZATION */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Net Realization Calculation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                Set Target Asking Price
              </h2>
              <p className="text-xs text-muted-foreground">
                See exact net earnings after freight before publishing your lot.
              </p>
            </div>

            {/* Asking Price Input */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Your Expected Asking Rate (₹/quintal)
                </label>
                <span className="text-xs font-bold text-muted-foreground">
                  Mandi Benchmark: ₹{currentBenchmark}/q
                </span>
              </div>
              <input
                type="number"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(Number(e.target.value))}
                className="w-full text-2xl font-black p-3 border border-input rounded-lg bg-background outline-none focus:border-primary"
              />
              {errors.expectedPrice && <p className="text-xs text-rose-600">{errors.expectedPrice}</p>}
            </div>

            {/* Financial Breakdown Card */}
            <div className="border border-primary/30 rounded-xl bg-primary/5 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/20 pb-3">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Lot Summary</span>
                  <p className="text-lg font-black text-foreground">
                    {quantity} Quintals {commodity.toUpperCase()} ({qualityGrade})
                  </p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Matching Buyers</span>
                  <p className="text-lg font-black text-primary">3 Active Processors</p>
                </div>
              </div>

              {/* Deduction Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-card p-3.5 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Asking Rate</span>
                  <span className="text-base font-black text-foreground">₹{expectedPrice}/q</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Est. Freight</span>
                  <span className="text-base font-black text-rose-700">-₹{estimatedFreightPerQ}/q</span>
                </div>
                <div>
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Net In Pocket</span>
                  <span className="text-base font-black text-emerald-800">₹{estimatedNetRealizationPerQ}/q</span>
                </div>
              </div>

              {/* Flagship Total Realization Banner */}
              <div className="bg-emerald-600 text-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                    Projected Total Net Farm-Gate Payout
                  </span>
                  <p className="text-xs opacity-80">
                    Full lot payout after transport deductions
                  </p>
                </div>
                <span className="text-3xl font-black tracking-tight">
                  ₹{potentialTotalNet.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER CONTROLS */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="font-bold text-xs"
          >
            Back
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="font-bold text-xs px-6">
              Continue
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="font-bold text-sm px-8 shadow-md"
            >
              {submitting ? "Publishing Lot..." : "Publish & Find Buyers"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
