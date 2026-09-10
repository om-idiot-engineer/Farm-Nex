"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  MessageSquare,
  Sprout,
  Building2,
  ShieldCheck,
  Star,
  Award,
  Layers,
  FileCheck2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
  DollarSign,
  Phone,
  Mail,
  Scale
} from "lucide-react";
import { getProfile } from "@/lib/services/domain";
import type { DemoProfile } from "@/lib/data/demo";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const res = getProfile(id);
      setProfile(res.data);
      setLoading(false);
    }
  }, [id]);

  if (loading) return <LoadingSkeleton variant="detail" />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <EmptyState
          title="Profile Not Found"
          description="The requested farmer or commercial buyer profile could not be located on the network."
          action="Browse Directory"
          href="/network"
        />
      </div>
    );
  }

  const isFarmer = profile.role === "farmer" || profile.role === "fpo";
  const initials = profile.name.slice(0, 2).toUpperCase();

  return (
    <div className={`max-w-5xl mx-auto space-y-6 pb-12 ${!isFarmer ? "theme-buyer" : ""}`}>
      {/* Top Banner Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs relative">
        {/* Cover Canvas */}
        <div
          className={`h-36 w-full ${
            isFarmer
              ? "bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-900/40"
              : "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950"
          } relative`}
        >
          <div className="absolute right-4 bottom-3 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-black/40 text-white backdrop-blur-xs">
              {isFarmer ? "Agricultural Producer" : "Institutional Buyer"}
            </span>
          </div>
        </div>

        {/* Profile Identity Row */}
        <div className="p-6 md:p-8 pt-0 relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div
              className={`h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-black shadow-md border-4 border-card text-white shrink-0 ${
                isFarmer ? "bg-emerald-700" : "bg-blue-700"
              }`}
            >
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {profile.name}
                </h1>
                <TrustBadge type={isFarmer ? "producer" : "buyer"} size="md" />
              </div>

              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">{profile.headline || (isFarmer ? "Grain & Oilseed Producer" : "Bulk Commodity Procurement")}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {profile.location}
                </span>
                {profile.gstNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-primary font-bold">GST: {profile.gstNumber}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild className="font-bold text-xs shadow-xs">
              <Link href={`/messages?recipientId=${profile.id}&subject=Trade Inquiry with ${profile.name}`}>
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Message {isFarmer ? "Farmer" : "Procurement Desk"}
              </Link>
            </Button>
          </div>
        </div>

        {/* About Bio Section */}
        <div className="px-6 md:px-8 pb-6 pt-2 border-t border-border/60">
          <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
            {profile.about ||
              (isFarmer
                ? `${profile.name} manages commercial agricultural land in ${profile.location}, specializing in high-grade harvest produce with certified electronic weighbridge tare records and zero-default trade settlement history.`
                : `${profile.name} operates bulk commodity processing facilities in ${profile.location}, sourcing directly from verified farmers and FPOs with instant digital escrow release.`)}
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            {isFarmer ? "Landholding" : "Annual Procurement"}
          </span>
          <p className="text-xl font-black text-foreground mt-1">
            {isFarmer ? `${profile.farmSizeAcres || 18} Acres` : profile.procurementCapacity || "15,000 MT / yr"}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {isFarmer ? (profile.soilType || "Rich Black Cotton Soil") : "Active Processing Capacity"}
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Completed Contracts
          </span>
          <p className="text-xl font-black text-primary mt-1">
            {profile.completedDealsCount || (isFarmer ? 24 : 82)} Deals
          </p>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Fulfillment Rate
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            {isFarmer ? "Harvest Reliability" : "Payment Speed"}
          </span>
          <p className="text-xl font-black text-emerald-800 dark:text-emerald-400 mt-1">
            {profile.paymentReliability || "24h Escrow Release"}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Bank Settlement Track Record
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Average Counterparty Rating
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-xl font-black text-foreground">{profile.rating || 4.9}</p>
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current text-amber-500/80" />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Based on {profile.reviews?.length || 16} trade ratings
          </span>
        </div>
      </div>

      {/* Main Grid: Details & Commercial Active Listings/Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Commercial Produce or Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Offerings / Demand Box */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {isFarmer ? (
                  <>
                    <Sprout className="h-4 w-4 text-emerald-600" /> Active Farm Produce Lots (3)
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 text-blue-600" /> Open Procurement Requirements (2)
                  </>
                )}
              </h2>
              <span className="text-xs font-bold text-primary">Live on FarmNex</span>
            </div>

            <div className="space-y-3">
              {isFarmer ? (
                <>
                  <div className="border border-border rounded-xl p-4 hover:border-primary/50 transition-all bg-card/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-primary uppercase">Soybean · Lot #SB-2026-08</span>
                        <h3 className="font-bold text-base text-foreground">Grade A Yellow Soybean · 200 Quintals</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Moisture: 10.4% · Foreign Matter: &le; 1.2% · Wooden pallet storage
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-foreground">₹5,420/q</span>
                        <span className="text-[10px] text-muted-foreground block">Farm Gate</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                      <span className="text-muted-foreground">Sanwer Hub, Indore</span>
                      <Button asChild size="sm" className="h-7 font-bold text-xs">
                        <Link href="/deals/deal-001">Initiate Deal <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 hover:border-primary/50 transition-all bg-card/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-primary uppercase">Wheat · Lot #WH-2026-11</span>
                        <h3 className="font-bold text-base text-foreground">Sharbati Milling Wheat · 120 Quintals</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Moisture: 9.8% · High Luster Grain · Ready for dispatch
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-foreground">₹2,410/q</span>
                        <span className="text-[10px] text-muted-foreground block">Farm Gate</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                      <span className="text-muted-foreground">Sanwer Hub, Indore</span>
                      <Button asChild size="sm" variant="outline" className="h-7 font-bold text-xs">
                        <Link href="/marketplace?mode=supply">Inspect Produce <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border border-border rounded-xl p-4 hover:border-primary/50 transition-all bg-card/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-blue-600 uppercase">RFQ #ITC-MP-091</span>
                        <h3 className="font-bold text-base text-foreground">Soybean (Process Grade) · 500 Quintals</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Moisture &le; 11.5% · Delivery at Dewas Processing Plant · 24h Escrow Release
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-foreground">₹5,400/q</span>
                        <span className="text-[10px] text-emerald-700 font-bold block">Target Rate</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                      <span className="text-muted-foreground">Intake Bay #3, Dewas</span>
                      <Button asChild size="sm" className="h-7 font-bold text-xs">
                        <Link href="/buyer/requirements">Submit Quote <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trade Counterparty Ratings & Reviews */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Verified Trade Testimonials
              </h2>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                100% Verified Transactions
              </span>
            </div>

            <div className="space-y-3">
              {(profile.reviews || [
                {
                  author: isFarmer ? "ITC Agri Division (Buyer)" : "Ramesh Patel (Farmer)",
                  role: isFarmer ? "Institutional Processor" : "Verified Farmer",
                  comment: isFarmer
                    ? "Consistent Grade A quality lot with exact weighbridge tare alignment. Seamless farm-gate loading."
                    : "Fastest escrow payment release in the region. Tare slip was accepted within 2 hours of mill gate entry.",
                  rating: 5,
                  date: "18 Feb 2026",
                },
                {
                  author: isFarmer ? "Agrocorp International" : "Dewas Farmers Producer Co.",
                  role: isFarmer ? "Bulk Buyer" : "FPO Collective",
                  comment: isFarmer
                    ? "Clean lot, moisture matched field test report accurately. Dispatched within 24 hours of agreement."
                    : "Fair dispute resolution and transparent deductions. Professional logistics bays.",
                  rating: 5,
                  date: "04 Feb 2026",
                },
              ]).map((rev, i) => (
                <div key={i} className="p-3.5 rounded-lg border border-border bg-muted/15 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground">{rev.author}</span>
                    <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3 w-3 fill-current" />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">{rev.role}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed pt-1">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Credentials & Network Verification */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
              Compliance & Credentials
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="rounded bg-emerald-100 dark:bg-emerald-950 p-2 text-emerald-800 dark:text-emerald-300 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {isFarmer ? "Aadhaar / Land Geotag Verified" : "GST & Corporate RoC Verified"}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {isFarmer ? "Physical farm boundaries recorded via GPS geotag" : "Tax registered entity with active e-way bill clearance"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded bg-blue-100 dark:bg-blue-950 p-2 text-blue-800 dark:text-blue-300 shrink-0">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Weighbridge Electronic Stamping</p>
                  <p className="text-muted-foreground text-[11px]">
                    Connects directly to authorized digital weighbridge calibration slips.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded bg-amber-100 dark:bg-amber-950 p-2 text-amber-800 dark:text-amber-300 shrink-0">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Digital Escrow Protected</p>
                  <p className="text-muted-foreground text-[11px]">
                    Bank-backed escrow security with automated contract disbursal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Contact Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-xs">
              Direct Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-foreground font-semibold">+91 98260 ••••• (Verified)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">{profile.id}@farmnex.trade</span>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full font-bold text-xs mt-2">
              <Link href={`/messages?recipientId=${profile.id}`}>
                Start Commercial Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
