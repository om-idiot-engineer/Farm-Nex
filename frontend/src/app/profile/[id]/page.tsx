"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Sprout,
  Building2,
  ShieldCheck,
  Star,
  Award,
  Clock,
  Layers,
  FileCheck2,
  Calendar,
  Share2,
} from "lucide-react";
import { getProfile, type ServiceResult } from "@/lib/services/domain";
import type { DemoProfile } from "@/lib/data/demo";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<DemoProfile | null>(null);

  useEffect(() => {
    if (id) {
      const res = getProfile(id);
      setProfile(res.data);
    }
  }, [id]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <EmptyState
          title="Profile not available"
          description="Public profile record could not be located."
          action="Browse marketplace"
          href="/marketplace"
          icon={Sprout}
        />
      </div>
    );
  }

  const trustType =
    profile.role === "buyer"
      ? "buyer"
      : profile.role === "fpo"
      ? "fpo"
      : profile.role === "expert"
      ? "expert"
      : "producer";

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/network">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Network
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert("Profile link copied!");
          }}
          className="text-xs"
        >
          <Share2 className="h-3.5 w-3.5 mr-1" />
          Share Profile
        </Button>
      </div>

      <DemoNotice>
        Public profiles and trust statistics are demonstration records until the live identity service is connected.
      </DemoNotice>

      {/* Main Profile Header Banner */}
      <article className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary/5 p-6 sm:p-8 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground shadow-md shrink-0">
                {profile.avatar}
              </span>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{profile.name}</h1>
                  <TrustBadge type={trustType} />
                </div>
                <p className="text-sm font-semibold text-primary">{profile.headline}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{profile.location}</span>
                  {profile.fpo && <span>· FPO: {profile.fpo}</span>}
                  {profile.business && <span>· Entity: {profile.business}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button asChild className="font-bold shadow-sm">
                <Link href={`/messages?conversation=demo-conversation-agrocorp`}>
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Send Message
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/80">
            {profile.stats.map((stat, i) => (
              <div key={i} className="bg-card/80 border border-border p-3 rounded-lg text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {stat.label}
                </span>
                <p className="text-xl font-black text-foreground mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Body: About & Operational Specs */}
        <div className="grid md:grid-cols-3 gap-6 p-6 sm:p-8">
          {/* Left 2 columns: About, Crops, Farm Specs */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">
                About & Operating Background
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{profile.about}</p>
            </div>

            {/* Crop Portfolio */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2.5">
                Crops & Commodities
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.crops.map((crop) => (
                  <span
                    key={crop}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Specific details based on role */}
            {profile.role === "farmer" && (
              <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-3 text-xs">
                <p className="font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                  Farm Specifications
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block">Holding Size</span>
                    <span className="font-bold text-foreground">{profile.farmSizeAcres || 18} Acres Cultivated</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Soil Classification</span>
                    <span className="font-bold text-foreground">{profile.soilType || "Deep Vertisol Soil"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Irrigation</span>
                    <span className="font-bold text-foreground">Tubewell & Drip Infrastructure</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Mandi Association</span>
                    <span className="font-bold text-foreground">Sanwer & Indore Mandi</span>
                  </div>
                </div>
              </div>
            )}

            {profile.role === "buyer" && (
              <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-3 text-xs">
                <p className="font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                  Commercial Sourcing Profile
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block">Processing Capacity</span>
                    <span className="font-bold text-foreground">{profile.procurementCapacity || "35,000 Q/Month"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Payment Settlement</span>
                    <span className="font-bold text-emerald-800">{profile.paymentReliability || "Within 24 hours"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">GST Status</span>
                    <span className="font-bold text-foreground">Verified Active ({profile.gstNumber || "23AAACA1122D1Z4"})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Pickup Transport</span>
                    <span className="font-bold text-foreground">Dedicated Multi-Axle Fleet</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {profile.reviews && profile.reviews.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Verified Peer Reviews ({profile.reviews.length})
                </h3>
                <div className="space-y-3">
                  {profile.reviews.map((r, i) => (
                    <div key={i} className="border border-border p-3.5 rounded-lg bg-card text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground">{r.author}</span>
                          <span className="text-muted-foreground text-[11px] ml-1.5">({r.role})</span>
                        </div>
                        <span className="text-amber-700 font-bold flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" /> {r.rating}.0
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{r.comment}</p>
                      <span className="text-[10px] text-muted-foreground block text-right">{r.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 1 column: Recent Activity & Trust Badges */}
          <div className="space-y-5 border-t md:border-t-0 md:border-l border-border md:pl-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
                Recent Platform Activity
              </h3>
              <div className="space-y-2.5">
                {profile.activity.map((act, i) => (
                  <div key={i} className="text-xs border-l-2 border-primary pl-3 py-1 space-y-0.5">
                    <p className="text-foreground font-medium">{act}</p>
                    <span className="text-[10px] text-muted-foreground">Verified platform event</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-2 text-xs">
              <p className="font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                Platform Credibility
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Direct trade agreements logged
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Mandi weighbridge history verified
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Bank escrow payment cleared
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
