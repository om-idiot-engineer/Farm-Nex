"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, ArrowRight, Sprout, TrendingUp, Store, Tractor, MapPin,
  CheckCircle2, ChevronRight, Package, Thermometer, Calendar, Clock, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/UserContext";
import { getFarmerListings, getAgreements, getBuyerMatches, getNotifications } from "@/lib/services/domain";
import type { CropListing, BuyerMatchOpportunity, TradeAgreement } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FarmerDashboard() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState("Week");

  const [listings, setListings] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<TradeAgreement[]>([]);
  const [matches, setMatches] = useState<BuyerMatchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    async function loadData() {
      try {
        const [listingsRes, agreementsRes, notifRes] = await Promise.all([
          getFarmerListings(),
          getAgreements(),
          getNotifications()
        ]);
        const lots = listingsRes.data || [];
        setListings(lots);
        setAgreements(agreementsRes.data || []);

        if (lots.length > 0) {
          const matchRes = await getBuyerMatches(lots[0].id);
          setMatches(matchRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);

  if (userLoading || loading) return <LoadingSkeleton />;

  const firstName = user?.name ? user.name.split(" ")[0] : "Farmer";

  // Calculate stats from real data
  const totalVolume = listings.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalEstRevenue = listings.reduce((acc, curr) => acc + (curr.quantity * curr.expected_price), 0);

  // Dummy data for visual chart because API doesn't have historical chart data
  const revenueData = [
    { label: "Mon", value: 18000 },
    { label: "Tue", value: 34000 },
    { label: "Wed", value: 48000 },
    { label: "Thu", value: 29000 },
    { label: "Fri", value: 50000 },
    { label: "Sat", value: 45000 },
    { label: "Sun", value: 55000 }
  ];

  const yAxisFormatter = (value: number) => {
    if (value === 0) return '₹0';
    return `₹${value / 1000}k`;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto theme-farmer">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">Good morning, {firstName} 👋</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Here&apos;s what&apos;s happening with your farm today • Sehore • 32°C</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-zinc-200 text-[12px] font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live Mandi
          </div>
          <Button asChild className="h-10 px-4 rounded-full font-semibold text-[13px] text-white bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <Link href="/farmer/produce/new">
              <Plus className="w-4 h-4 mr-2" /> List New Crop
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          { label: "Est. Revenue", value: `₹${totalEstRevenue.toLocaleString()}`, change: "+12.5%", up: true, icon: TrendingUp, grad: "from-emerald-500 to-green-600" },
          { label: "Active Listings", value: listings.length.toString(), change: "+1 new", up: true, icon: Store, grad: "from-amber-400 to-orange-500" },
          { label: "Total Volume", value: `${totalVolume} Qtl`, change: "Stable", up: true, icon: Package, grad: "from-violet-500 to-purple-600" },
          { label: "Buyer Matches", value: matches.length.toString(), change: "New alerts", up: true, icon: CheckCircle2, grad: "from-blue-500 to-cyan-500" }
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

      {/* Revenue Chart & Weather */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[16px] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-zinc-500" /> Revenue Analytics
            </h3>
            <div className="flex bg-zinc-100 p-1 rounded-full text-[12px] font-medium">
              <button className="px-4 py-1.5 rounded-full bg-white shadow-sm text-zinc-900">Week</button>
              <button className="px-4 py-1.5 rounded-full text-zinc-500 hover:text-zinc-900">Month</button>
              <button className="px-4 py-1.5 rounded-full text-zinc-500 hover:text-zinc-900">Year</button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#71717A' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#A1A1AA' }}
                  tickFormatter={yAxisFormatter}
                  domain={[0, 60000]}
                  ticks={[0, 10000, 30000, 50000]}
                />
                <Tooltip
                  cursor={{ fill: '#F4F4F5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar
                  dataKey="value"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-2 px-2 text-[12px] font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2 rounded-sm bg-emerald-500"></div> Revenue
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-white"></div> Trend
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-[20px] p-5 text-white relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[15px] flex items-center gap-2">Bhopal Weather</h3>
              <span className="text-[11px] bg-white/20 px-2 py-1 rounded-full">Live • IMD</span>
            </div>
            <div className="mt-4 flex items-end gap-4">
              <div className="text-[42px] font-extrabold leading-none">32°</div>
              <div className="text-[13px] opacity-90 leading-tight">
                Partly cloudy<br/>Humidity 64%
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[11px] opacity-80"><Thermometer className="w-3 h-3" /> Rain</div>
                <div className="font-bold text-[13px] mt-1">20% chance</div>
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[11px] opacity-80"><Sprout className="w-3 h-3" /> Soil</div>
                <div className="font-bold text-[13px] mt-1">28°C good</div>
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[11px] opacity-80"><Tractor className="w-3 h-3" /> Action</div>
                <div className="font-bold text-[13px] mt-1">Irrigate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Matches & Agreements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Buyer Matches */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            Top Buyer Matches
            <Link href="/deals" className="text-[11px] font-semibold text-emerald-600 hover:underline">View All</Link>
          </h3>
          <div className="space-y-3">
            {matches.length > 0 ? matches.slice(0, 3).map((match, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-extrabold text-[12px] shrink-0 text-blue-700 shadow-sm">
                  {match.buyer_name?.substring(0,2).toUpperCase() || 'BY'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 group-hover:text-emerald-700 transition-colors">{match.buyer_name || match.business_name}</div>
                  <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3"/> {match.distance_km}km away
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-zinc-900">₹{match.offered_price_per_quintal}</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Per Qtl</div>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-zinc-500 text-[12px]">No active buyer matches for your listings right now.</div>
            )}
          </div>
        </div>

        {/* Recent Agreements / Orders */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            Recent Orders & Agreements
            <Link href="/deals" className="text-[11px] font-semibold text-emerald-600 hover:underline">Manage All</Link>
          </h3>
          <div className="space-y-3">
            {agreements.length > 0 ? agreements.slice(0, 3).map((agr, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100 hover:border-blue-200 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-[12px] bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 capitalize">{agr.crop_id} - {agr.quantity} Qtl</div>
                  <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3"/> {agr.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{agr.status}</div>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-zinc-500 text-[12px]">No agreements created yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
