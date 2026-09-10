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
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
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

  if (loading) return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="h-48 bg-zinc-100 rounded-3xl animate-pulse"></div>
      <div className="h-64 bg-zinc-100 rounded-3xl animate-pulse"></div>
    </div>
  );

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

  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";
  const gradientClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";
  const softBg = isFarmer ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-blue-50 text-blue-800 border-blue-100";

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto ${themeClass}`}>
      {/* Top Banner Card */}
      <div className="bg-white rounded-[24px] border border-zinc-200 overflow-hidden shadow-sm relative">
        <div className={`h-[140px] w-full bg-gradient-to-r ${gradientClass} relative`}>
          <div className="absolute right-4 bottom-3 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
              {isFarmer ? "Verified Producer" : "Institutional Buyer"}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-0 relative -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className={`h-24 w-24 rounded-[20px] flex items-center justify-center text-[28px] font-extrabold shadow-lg border-4 border-white text-white shrink-0 bg-gradient-to-br ${gradientClass}`}>
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-zinc-900">
                  {profile.name}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest ml-1 shadow-sm">
                  Pro
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-zinc-600 mt-1">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-zinc-400" /> {profile.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-zinc-400" /> Joined {(profile as any).memberSince || "Jan 2024"}</span>
                {isFarmer ? (
                  <span className="flex items-center gap-1.5"><Sprout className="h-3.5 w-3.5 text-emerald-500" /> {(profile as any).farmSize || (profile as any).fpo || "30 Acres"}</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-blue-500" /> {(profile as any).businessType || (profile as any).business || "Agri-Processor"}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button size="lg" className={`w-full md:w-auto rounded-full font-bold text-[13px] text-white bg-gradient-to-br ${gradientClass} shadow-lg hover:scale-[1.02] transition-transform`} asChild>
              <Link href={`/messages?recipientId=${profile.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-2 md:pt-4 border-t border-zinc-100 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 mb-2">About</h3>
            <p className="text-[14px] text-zinc-700 leading-relaxed max-w-3xl">
              {profile.about}
            </p>
          </div>

          {true && (
            <div className="w-full md:w-[320px] shrink-0 border-l border-zinc-100 pl-0 md:pl-8">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {(profile as any).certifications || ["NPOP Organic", "ISO 9001"].map((cert) => (
                  <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-[12px] font-bold shadow-sm">
                    <Award className="h-3.5 w-3.5 text-amber-500" /> {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Trust Metrics */}
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500" /> Platform Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Trades</p>
                <p className="text-[24px] font-extrabold text-zinc-900">{(profile as any).metrics?.trades_completed || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Volume</p>
                <p className="text-[24px] font-extrabold text-zinc-900">{(profile as any).metrics?.volume_traded || "0 Qtl"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Fulfillment</p>
                <p className="text-[24px] font-extrabold text-emerald-600">{(profile as any).metrics?.fulfillment_rate || "100%"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Rating</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[24px] font-extrabold text-zinc-900">{(profile as any).metrics?.avg_rating || "5.0"}</p>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400 -mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Listings / Demands */}
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900 mb-5">
              {isFarmer ? "Active Harvest Lots" : "Active Procurement Demands"}
            </h2>

            <div className="space-y-3">
              {isFarmer && (profile as any).active_listings?.length ? (
                (profile as any).active_listings.map((lot: any, idx: number) => (
                  <div key={idx} className="border border-zinc-200 rounded-[16px] p-4 hover:border-emerald-300 transition-all bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Lot #{String(idx + 1).padStart(3, '0')}</span>
                        <h3 className="font-extrabold text-[15px] text-zinc-900 capitalize">{lot.crop_id} · {lot.quality_grade}</h3>
                      </div>
                      <p className="text-[12px] text-zinc-500 font-medium flex items-center gap-3 mt-1.5">
                        <span><b className="text-zinc-700">{lot.quantity}</b> Quintals</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {lot.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-200">
                      <div className="text-left sm:text-right">
                        <span className="text-[16px] font-black text-zinc-900 block">₹{lot.expected_price}/q</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Asking Price</span>
                      </div>
                      <Button asChild size="sm" className="h-8 rounded-full font-bold text-[12px] bg-zinc-900 text-white hover:bg-black">
                        <Link href="/marketplace?mode=supply">Inspect <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : !isFarmer && (profile as any).active_demands?.length ? (
                (profile as any).active_demands.map((demand: any, idx: number) => (
                  <div key={idx} className="border border-zinc-200 rounded-[16px] p-4 hover:border-blue-300 transition-all bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">RFQ #{String(idx + 1).padStart(3, '0')}</span>
                        <h3 className="font-extrabold text-[15px] text-zinc-900 capitalize">{demand.crop_id} · {demand.quality_grade}</h3>
                      </div>
                      <p className="text-[12px] text-zinc-500 font-medium flex items-center gap-3 mt-1.5">
                        <span><b className="text-zinc-700">{demand.quantity_needed}</b> Quintals Needed</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {demand.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-200">
                      <div className="text-left sm:text-right">
                        <span className="text-[16px] font-black text-zinc-900 block">₹{demand.offered_price}/q</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Target Rate</span>
                      </div>
                      <Button asChild size="sm" className="h-8 rounded-full font-bold text-[12px] bg-zinc-900 text-white hover:bg-black">
                        <Link href="/buyer/requirements">Quote <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed border-zinc-200 rounded-[16px] bg-zinc-50/50">
                  <p className="text-[13px] font-medium text-zinc-500">No active {isFarmer ? "listings" : "demands"} at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900">
                Verified Trade Reviews
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${softBg}`}>
                100% Verified
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {((profile as any).reviews || []).map((rev: any, i: number) => (
                <div key={i} className="p-4 rounded-[16px] border border-zinc-100 bg-zinc-50 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[13px] text-zinc-900 truncate pr-2">{rev.author}</span>
                    <span className="text-[10px] text-zinc-500 font-medium shrink-0">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] text-zinc-500 ml-1.5 font-semibold bg-white border border-zinc-200 px-1.5 py-0.5 rounded">{rev.role}</span>
                  </div>
                  <p className="text-zinc-600 text-[13px] leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-zinc-900 mb-5 pb-3 border-b border-zinc-100">
              Compliance & Credentials
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 shrink-0 border border-emerald-100 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[13px] text-zinc-900">
                    {isFarmer ? "Aadhaar / Land Geotag Verified" : "GST & Corporate RoC Verified"}
                  </p>
                  <p className="text-zinc-500 text-[11px] leading-relaxed mt-1 font-medium">
                    {isFarmer ? "Physical farm boundaries recorded via GPS geotag." : "Tax registered entity with active e-way bill clearance."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 shrink-0 border border-blue-100 shadow-sm">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[13px] text-zinc-900">Weighbridge e-Stamping</p>
                  <p className="text-zinc-500 text-[11px] leading-relaxed mt-1 font-medium">
                    Connects directly to authorized digital weighbridge slips.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 shrink-0 border border-amber-100 shadow-sm">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[13px] text-zinc-900">Digital Escrow Protected</p>
                  <p className="text-zinc-500 text-[11px] leading-relaxed mt-1 font-medium">
                    Bank-backed escrow security with automated contract disbursal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${gradientClass} rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] opacity-90 mb-4">
              Direct Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-mono font-bold text-[14px]">+91 98260 ••••• <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded ml-1">Verified</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="font-medium text-[13px] opacity-90">{profile.id}@farmnex.trade</span>
              </div>
            </div>
            <Button asChild size="sm" className="w-full font-bold text-[13px] mt-6 bg-white text-zinc-900 hover:bg-zinc-100 rounded-full shadow-sm h-10">
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
