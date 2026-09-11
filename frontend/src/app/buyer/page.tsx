"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, ArrowRight, Store, MapPin,
  Search, Building2, ShieldCheck, Truck,
  CheckCircle2, Clock, Layers, FileText,
  TrendingDown, Award, Sparkles, Bookmark, MessageSquare, TrendingUp, DollarSign, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/UserContext";
import { getBuyerDemands, getMarketplaceListings, getAgreements, getProcurementRequirements } from "@/lib/services/domain";
import type { DemandPost, CropListing } from "@/lib/api";
import type { ExtendedTradeAgreement, ProcurementRequirement } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function BuyerDashboard() {
  const { user, loading: userLoading } = useUser();
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [rfqs, setRfqs] = useState<ProcurementRequirement[]>([]);
  const [supply, setSupply] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (userLoading || !user) return;
    async function loadData() {
      try {
        const { getTrendingCrops, getMatchingSuggestions, getNotifications } = await import("@/lib/services/domain");
        const [demandsRes, supplyRes, agreementsRes, rfqRes, suggRes, trendRes, notifRes] = await Promise.all([
          getBuyerDemands(),
          getMarketplaceListings(),
          getAgreements(),
          getProcurementRequirements(),
          getMatchingSuggestions(),
          getTrendingCrops(),
          getNotifications(),
        ]);
        setDemands(demandsRes.data || []);
        setSupply(supplyRes.data || []);
        setAgreements(agreementsRes.data || []);
        setRfqs(rfqRes.data || []);
        setSuggestions(suggRes.data || []);
        setTrending(trendRes.data?.top_gainers || []);
        const notifs = notifRes.data || [];
        setUnreadCount(notifs.filter((n: any) => n.unread).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);

  if (userLoading || loading) return <LoadingSkeleton />;

  const firstName = user?.name ? user.name.split(" ")[0] : "Corporate";

  const totalVolumeProcured = agreements.reduce((acc, curr) => acc + (curr.quantity as number), 0);
  const totalSpend = agreements.reduce((acc, curr) => acc + ((curr.quantity as number) * (curr.price_per_quintal as number)), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto theme-buyer">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">Good morning, {firstName} 👋</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Here&apos;s your daily procurement overview • Wholesale Buyer</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-zinc-200 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-600" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-zinc-200 text-[12px] font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Market Live
          </div>
          <Button asChild className="h-10 px-4 rounded-full font-semibold text-[13px] text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <Link href="/buyer/requirements/new">
              <Plus className="w-4 h-4 mr-2" /> Post Requirement
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          { label: "Total Procured", value: `${totalVolumeProcured} Qtl`, change: "+2.4%", up: true, icon: TrendingUp, grad: "from-blue-500 to-indigo-600" },
          { label: "Active RFQs", value: rfqs.length.toString(), change: "+1 new", up: true, icon: FileText, grad: "from-amber-400 to-orange-500" },
          { label: "Pending Deliveries", value: agreements.filter(a => a.status === 'in_transit').length.toString(), change: "Track live", up: true, icon: Truck, grad: "from-violet-500 to-purple-600" },
          { label: "Total Spend", value: `₹${(totalSpend/100000).toFixed(1)}L`, change: "Saved 12%", up: true, icon: DollarSign, grad: "from-emerald-500 to-teal-500" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.grad} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5 ${stat.up ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {stat.up ? "↑" : "•"} {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[22px] font-extrabold mt-1">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending Crops (Hot Crops) */}
      {trending.length > 0 && (
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            🔥 Hot Crops (Live Mandi Trending)
            <Link href="/intelligence" className="text-[11px] font-semibold text-blue-600 hover:underline">Market Intelligence</Link>
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((crop, i) => (
              <div key={i} className="min-w-[180px] flex-shrink-0 bg-zinc-50 border border-zinc-100 rounded-[16px] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-zinc-900">{crop.commodity}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${crop.trend === 'up' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {crop.trend === 'up' ? '▲' : '▼'} {Math.abs(crop.dod_change_pct)}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[16px] font-black">₹{crop.current_price}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                    <span>Vol: {crop.arrival_volume_change_pct > 0 ? '+' : ''}{crop.arrival_volume_change_pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matching Supplies & In-Transit Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recommended Supply */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            Suggested Deals (Top Matches)
            <Link href="/marketplace?view=supply" className="text-[11px] font-semibold text-blue-600 hover:underline">View All</Link>
          </h3>
          <div className="space-y-3">
            {suggestions.length > 0 ? suggestions.slice(0, 3).map((match, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center font-extrabold text-[12px] shrink-0 text-emerald-700 shadow-sm">
                  {match.target_name?.substring(0,2).toUpperCase() || 'FM'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 group-hover:text-blue-700 transition-colors capitalize">{match.target_name}</div>
                  <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3"/> {match.target_location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-zinc-900">₹{match.net_realization_per_q || match.matching_score}</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Per Qtl</div>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-zinc-500 text-[12px]">No active farm supply available matching your RFQs.</div>
            )}
          </div>
        </div>

        {/* Recent Agreements / Deliveries */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            Recent Procurements
            <Link href="/deals" className="text-[11px] font-semibold text-blue-600 hover:underline">Track All</Link>
          </h3>
          <div className="space-y-3">
            {agreements.length > 0 ? agreements.slice(0, 3).map((agr, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100 hover:border-blue-200 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-[12px] bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 capitalize">{agr.crop_id} - {agr.quantity} Qtl</div>
                  <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3"/> {agr.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{agr.status}</div>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-zinc-500 text-[12px]">No procurements yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
