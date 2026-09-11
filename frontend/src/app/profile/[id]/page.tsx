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
  Scale,
  Copy,
  Check,
  UserPlus,
  UsersRound,
  BadgeCheck,
  Heart
} from "lucide-react";
import { getProfile, getNetworkPosts, type NetworkPost } from "@/lib/services/domain";
import type { DemoProfile } from "@/lib/data/demo";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"showcase" | "activity" | "trades" | "credentials">("showcase");
  const [userPosts, setUserPosts] = useState<NetworkPost[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const res = getProfile(id);
      setProfile(res.data);

      getNetworkPosts().then((postRes) => {
        const matching = (postRes.data || []).filter(
          (p) => p.user_id === res.data.id || (res.data.name && p.author_name.toLowerCase() === res.data.name.toLowerCase())
        );
        setUserPosts(matching);
      }).catch(() => {});

      setLoading(false);
    }
  }, [id]);

  const copyProfileLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
  const isExpert = profile.role === "expert";
  const isConsumer = profile.role === "consumer";
  const initials = profile.avatar || profile.name.slice(0, 2).toUpperCase();
  const handle = profile.profileHandle || `@${profile.id.replace(/^demo-/, '').replace(/-/g, '.')}`;

  const themeClass = isFarmer ? "theme-farmer" : isExpert ? "theme-zinc" : "theme-buyer";
  const gradientClass = isFarmer
    ? "from-emerald-600 via-green-600 to-teal-700"
    : isExpert
      ? "from-slate-700 via-zinc-800 to-zinc-950"
      : isConsumer
        ? "from-amber-500 via-orange-500 to-pink-600"
        : "from-blue-600 via-indigo-600 to-violet-700";

  const softBg = isFarmer
    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
    : isExpert
      ? "bg-zinc-100 text-zinc-800 border-zinc-200"
      : "bg-blue-50 text-blue-800 border-blue-100";

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto ${themeClass}`}>
      {/* Top Banner Card */}
      <div className="bg-white rounded-[24px] border border-zinc-200 overflow-hidden shadow-sm relative">
        {/* Cover Banner */}
        <div className={`h-40 sm:h-52 w-full bg-gradient-to-r ${gradientClass} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/15"></div>
          {/* Subtle grid pattern overlay for realistic depth */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 flex items-center gap-2 z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-sm flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-white" />
              {isFarmer ? "Verified Producer" : isExpert ? "Agri-Expert Consultant" : isConsumer ? "Community Consumer" : "Institutional Buyer"}
            </span>
          </div>

          <div className="absolute left-6 bottom-4 text-white/80 text-[11px] font-mono tracking-wider hidden sm:flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
            <span>MANDI ID:</span>
            <span className="font-semibold text-white">{profile.id.toUpperCase()}</span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 md:px-8 pb-6 relative">
          {/* Top row: Avatar + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            {/* Avatar with clean border and shadow */}
            <div className={`h-28 w-28 sm:h-36 sm:w-36 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-xl border-[5px] border-white text-white shrink-0 bg-gradient-to-br ${gradientClass} ring-1 ring-black/5`}>
              {initials}
            </div>

            {/* Action Buttons aligned on the right */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
              <Button
                onClick={() => setConnected(!connected)}
                variant={connected ? "outline" : "default"}
                size="default"
                className={`h-10 px-5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  connected
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : `text-white bg-gradient-to-br ${gradientClass} hover:opacity-95 hover:shadow`
                }`}
              >
                {connected ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5" /> Connected
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1.5" /> Connect
                  </>
                )}
              </Button>

              <Button size="default" variant="outline" className="h-10 px-4 rounded-xl font-bold text-sm border-zinc-300 text-zinc-800 shadow-sm hover:bg-zinc-50" asChild>
                <Link href={`/messages?recipientId=${profile.id}`}>
                  <MessageSquare className="h-4 w-4 mr-1.5 text-zinc-500" /> Message
                </Link>
              </Button>

              <Button
                onClick={copyProfileLink}
                size="default"
                variant="outline"
                className="h-10 px-4 rounded-xl font-bold text-sm border-zinc-300 text-zinc-800 shadow-sm hover:bg-zinc-50"
                title="Copy Profile Link"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600 mr-1.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-zinc-500 mr-1.5" /> Share ID
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="space-y-3">
            {/* Name + Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
                  {profile.name}
                </h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    Verified
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {profile.role.toUpperCase()}
                </span>
              </div>

              {/* Handle & Profile ID */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-zinc-500">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
                  {handle}
                </span>
                <span className="text-zinc-300">•</span>
                <span>
                  Profile ID: <span className="font-mono text-zinc-700 font-semibold">{profile.id}</span>
                </span>
              </div>
            </div>

            {/* Headline / Bio */}
            <p className="text-base text-zinc-700 font-medium max-w-3xl leading-relaxed">
              {profile.headline}
            </p>

            {/* Key Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-zinc-600 pt-1">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-zinc-400 shrink-0" /> {profile.location}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-zinc-400 shrink-0" /> Joined {profile.memberSince || "Jan 2024"}</span>
              <span className="flex items-center gap-1.5"><UsersRound className="h-4 w-4 text-emerald-600 shrink-0" /> <b className="text-zinc-900 font-bold">{profile.connectionsCount || 1240}</b> Connections</span>
              {isFarmer ? (
                <span className="flex items-center gap-1.5"><Sprout className="h-4 w-4 text-emerald-600 shrink-0" /> {profile.farmSizeAcres ? `${profile.farmSizeAcres} Acres` : profile.fpo || "Direct Cultivator"}</span>
              ) : (
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-blue-600 shrink-0" /> {profile.business || profile.procurementCapacity || "Agri Commercial"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 md:px-8 border-t border-zinc-100 flex items-center gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "showcase", label: "Showcase & Bio" },
            { id: "activity", label: `Network Posts (${userPosts.length})` },
            { id: "trades", label: isFarmer ? "Produce Listings" : "Procurement RFQs" },
            { id: "credentials", label: "Trust & Compliance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-[14px] font-bold border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left Column Content */}
        <div className="space-y-6">

          {/* TAB 1: SHOWCASE & BIO */}
          {activeTab === "showcase" && (
            <>
              {/* About Card */}
              <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
                <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-zinc-900 mb-3">About & Background</h3>
                <p className="text-[14px] text-zinc-700 leading-relaxed">
                  {profile.about}
                </p>

                {/* Tags / Crops */}
                <div className="mt-5 pt-5 border-t border-zinc-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">Focus Commodities & Crops</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.crops.map((crop, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-[12px] font-bold">
                        🌱 {crop.replace(/^c0000000-0000-0000-0000-000000000001$/, 'Soybean').replace(/^c0000000-0000-0000-0000-000000000002$/, 'Wheat')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Performance Metrics */}
              <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
                <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900 mb-5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" /> Verified Commercial Track Record
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Trades</p>
                    <p className="text-[24px] font-extrabold text-zinc-900">
                      {profile.completedDealsCount || (profile as any).metrics?.trades_completed || 18}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Volume</p>
                    <p className="text-[24px] font-extrabold text-zinc-900">
                      {(profile as any).metrics?.volume_traded || profile.procurementCapacity || "4,800 Qtl"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Fulfillment</p>
                    <p className="text-[24px] font-extrabold text-emerald-600">
                      {(profile as any).metrics?.fulfillment_rate || profile.paymentReliability || "99.2%"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Rating</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[24px] font-extrabold text-zinc-900">{profile.rating || 4.9}</p>
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400 -mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Trade Reviews */}
              <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900">
                    Verified Partner Reviews
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${softBg}`}>
                    100% Escrow Backed
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {(profile.reviews || [
                    { author: "Anita Sharma (Agrocorp)", role: "Bulk Buyer", comment: "Excellent moisture consistency and clean bagging. Exactly as assayed.", rating: 5, date: "Aug 2026" },
                    { author: "Vikram Singh (Bhopal Solvex)", role: "Bulk Buyer", comment: "Prompt loading and prompt communication on vehicle dispatch.", rating: 5, date: "May 2026" },
                  ]).map((rev: any, i: number) => (
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
            </>
          )}

          {/* TAB 2: NETWORK POSTS & ACTIVITY */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-zinc-200 p-12 text-center">
                  <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <h4 className="font-bold text-[15px] text-zinc-800">No community posts yet</h4>
                  <p className="text-[13px] text-zinc-500 mt-1">
                    {profile.name} hasn’t published any updates to the Kisan Network feed recently.
                  </p>
                </div>
              ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-zinc-900">{post.author_name}</span>
                        <span className="text-[11px] text-zinc-400">• {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-100 rounded text-zinc-600">
                        {post.topic || post.tag}
                      </span>
                    </div>
                    <p className="text-[14px] text-zinc-800 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>
                    <div className="pt-2 border-t border-zinc-100 flex items-center gap-4 text-[12px] text-zinc-500">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {post.reactions || 0} reactions</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> {post.comments || 0} replies</span>
                      <Link href={`/network/${post.id}`} className="ml-auto font-bold text-blue-600 hover:underline">
                        View Thread →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE LISTINGS / DEMANDS */}
          {activeTab === "trades" && (
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
                          <h3 className="font-extrabold text-[15px] text-zinc-900 capitalize">
                            {lot.crop_id?.replace(/^c0000000-0000-0000-0000-000000000001$/, 'Soybean')} · {lot.quality_grade}
                          </h3>
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
                          <Link href={`/marketplace/listings/${lot.id}`}>Inspect <ArrowRight className="h-3 w-3 ml-1" /></Link>
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
                          <h3 className="font-extrabold text-[15px] text-zinc-900 capitalize">
                            {demand.crop_id?.replace(/^c0000000-0000-0000-0000-000000000001$/, 'Soybean')} · {demand.quality_grade}
                          </h3>
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
                          <Link href={`/marketplace/requirements/${demand.id}`}>Quote <ArrowRight className="h-3 w-3 ml-1" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border border-dashed border-zinc-200 rounded-[16px] bg-zinc-50/50">
                    <p className="text-[13px] font-medium text-zinc-500">No active {isFarmer ? "produce listings" : "demands"} at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLIANCE & TRUST */}
          {activeTab === "credentials" && (
            <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm space-y-6">
              <h3 className="text-[14px] font-extrabold uppercase tracking-wider text-zinc-900">
                Verified Identity & Certification Records
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[13px]">
                    <ShieldCheck className="w-4 h-4" /> Government Identity
                  </div>
                  <p className="text-[13px] text-zinc-800 font-semibold">
                    {isFarmer ? "Aadhaar e-KYC Verified & Land Geotag" : "Active GSTIN & MCA Registration"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Verified through government portal API. Physical boundary coordinates secured.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-[13px]">
                    <Scale className="w-4 h-4" /> Digital Weighbridge Clear
                  </div>
                  <p className="text-[13px] text-zinc-800 font-semibold">
                    e-Stamping & Automatic Slip Matching
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Authorised integration with state APMC digital tare and weighment equipment.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-zinc-500 mb-3">All Active Certifications</h4>
                <div className="flex flex-wrap gap-2.5">
                  {(profile.certifications || ["NPOP Organic", "ISO 9001"]).map((cert) => (
                    <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[12px] font-bold shadow-sm">
                      <Award className="h-3.5 w-3.5 text-amber-500" /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Networking Widget & Direct Contact */}
        <div className="space-y-6">
          {/* Networking Card */}
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm space-y-4">
            <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Networking ID Card
            </h3>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                <span>Network Handle</span>
                <span className="text-emerald-700 font-bold">Active Member</span>
              </div>
              <div className="font-mono text-[16px] font-black text-zinc-900">
                {handle}
              </div>
              <p className="text-[11px] text-zinc-500">
                Direct shareable profile handle across the FarmNex mandi network.
              </p>
              <Button
                onClick={copyProfileLink}
                size="sm"
                variant="outline"
                className="w-full h-8 text-[11px] font-bold rounded-full bg-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? "Copied Link" : "Copy Profile Link"}
              </Button>
            </div>
          </div>

          {/* Compliance & Credentials */}
          <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-zinc-900 mb-5 pb-3 border-b border-zinc-100">
              Compliance & Safety
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

          {/* Direct Contact Card */}
          <div className={`bg-gradient-to-br ${gradientClass} rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] opacity-90 mb-4">
              Direct Trade Channel
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-mono font-bold text-[14px]">
                  {profile.phone ? `${profile.phone.slice(0, 5)} •••••` : "+91 98260 •••••"}{" "}
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded ml-1">Verified</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="font-medium text-[13px] opacity-90 truncate max-w-[200px]">
                  {profile.email || `${profile.id}@farmnex.trade`}
                </span>
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
