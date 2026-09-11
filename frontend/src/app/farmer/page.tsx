"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, ArrowRight, Sprout, TrendingUp, Store, Tractor, MapPin,
  CheckCircle2, ChevronRight, Package, Thermometer, Calendar, Clock, BarChart3,
  Flame, Sparkles, PieChart as PieChartIcon, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/UserContext";
import { getFarmerListings, getAgreements, getBuyerMatches, getNotifications } from "@/lib/services/domain";
import type { CropListing, BuyerMatchOpportunity, TradeAgreement } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function FarmerDashboard() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState("Week");

  const [listings, setListings] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<TradeAgreement[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (userLoading || !user) return;
    async function loadData() {
      try {
        const { getTrendingCrops, getMatchingSuggestions, getNotifications } = await import("@/lib/services/domain");
        const [listingsRes, agreementsRes, suggRes, trendRes, notifRes] = await Promise.all([
          getFarmerListings(),
          getAgreements(),
          getMatchingSuggestions(),
          getTrendingCrops(),
          getNotifications(),
        ]);
        const lots = listingsRes.data || [];
        setListings(lots);
        setAgreements(agreementsRes.data || []);
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

  // Crop performance distribution calculated dynamically from farmer's listed produce
  const cropPerformanceData = React.useMemo(() => {
    if (!listings || listings.length === 0) {
      return [];
    }

    const cropMap: Record<string, { quantity: number; amount: number }> = {};
    const cropNames: Record<string, string> = {
      "c0000000-0000-0000-0000-000000000001": "Soybean",
      "c0000000-0000-0000-0000-000000000002": "Wheat",
      "c0000000-0000-0000-0000-000000000003": "Cotton",
      "c0000000-0000-0000-0000-000000000004": "Maize",
      "c0000000-0000-0000-0000-000000000005": "Mustard",
      "soybean": "Soybean",
      "wheat": "Wheat",
      "cotton": "Cotton",
      "maize": "Maize",
      "mustard": "Mustard",
      "tomato": "Tomato",
      "onion": "Onion",
      "potato": "Potato",
      "gram": "Gram",
    };

    let totalVal = 0;
    listings.forEach((item) => {
      const rawId = (item.crop_id || "Produce").trim();
      const displayName =
        cropNames[rawId] ||
        cropNames[rawId.toLowerCase()] ||
        rawId.charAt(0).toUpperCase() + rawId.slice(1);
      const estAmount = (item.quantity || 0) * (item.expected_price || 0);

      if (!cropMap[displayName]) {
        cropMap[displayName] = { quantity: 0, amount: 0 };
      }
      cropMap[displayName].quantity += item.quantity || 0;
      cropMap[displayName].amount += estAmount;
      totalVal += estAmount;
    });

    const palette = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899", "#14B8A6"];

    return Object.entries(cropMap).map(([name, data], idx) => {
      const percentage = totalVal > 0 ? Math.round((data.amount / totalVal) * 100) : 0;
      return {
        name,
        value: percentage,
        amount: data.amount,
        quantity: data.quantity,
        color: palette[idx % palette.length],
      };
    });
  }, [listings]);

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

  // Price trends mandi data
  const priceTrendsData = [
    { date: "1 May", Tomato: 35, Wheat: 40, Onion: 32 },
    { date: "5 May", Tomato: 38, Wheat: 42, Onion: 35 },
    { date: "9 May", Tomato: 42, Wheat: 45, Onion: 38 },
    { date: "13 May", Tomato: 40, Wheat: 44, Onion: 37 },
    { date: "17 May", Tomato: 46, Wheat: 48, Onion: 42 },
    { date: "21 May", Tomato: 49, Wheat: 50, Onion: 45 },
    { date: "Today", Tomato: 52, Wheat: 51, Onion: 48 }
  ];

  // Order Funnel stages
  const orderFunnel = [
    { label: "Pending", count: 12, max: 50, color: "bg-emerald-500" },
    { label: "Negotiating", count: 8, max: 50, color: "bg-amber-400" },
    { label: "Shipped", count: 15, max: 50, color: "bg-blue-500" },
    { label: "Delivered", count: 42, max: 50, color: "bg-emerald-600" }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto theme-farmer">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">Good morning, {firstName} 👋</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Here&apos;s what&apos;s happening with your farm today • Sehore • 32°C</p>
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
          { label: "Buyer Matches", value: suggestions.length.toString(), change: "New alerts", up: true, icon: CheckCircle2, grad: "from-blue-500 to-cyan-500", href: "/notifications" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const CardContent = (
            <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all h-full flex flex-col justify-between">
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

          return stat.href ? (
            <Link key={idx} href={stat.href} className="block group">
              {CardContent}
            </Link>
          ) : (
            <div key={idx}>
              {CardContent}
            </div>
          );
        })}
      </div>

      {/* Trending Crops (Hot Crops) */}
      {trending.length > 0 && (
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            🔥 Hot Crops (Live Mandi Trending)
            <Link href="/intelligence" className="text-[11px] font-semibold text-emerald-600 hover:underline">Market Intelligence</Link>
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((crop, i) => (
              <div key={i} className="min-w-[180px] flex-shrink-0 bg-zinc-50 border border-zinc-100 rounded-[16px] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-zinc-900">{crop.commodity}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${crop.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
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

        {/* Crop Performance Card */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[16px] flex items-center gap-2">
              🌾 Crop Performance
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-100">+12% yield</span>
          </div>

          {/* Donut Chart */}
          {cropPerformanceData.length === 0 ? (
            <div className="h-[240px] flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <Sprout className="w-6 h-6" />
              </div>
              <p className="text-[13px] font-semibold text-zinc-700">No crops listed yet</p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
                List your produce to see your crop performance and revenue breakdown.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-full text-xs font-semibold">
                <Link href="/farmer/produce/new">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Crop
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="relative h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cropPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {cropPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[11px] text-zinc-400 font-medium">Total</div>
                  <div className="text-[20px] font-extrabold text-zinc-900 leading-tight">
                    {cropPerformanceData.length} {cropPerformanceData.length === 1 ? "Crop" : "Crops"}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 mt-2">
                {cropPerformanceData.map((crop, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: crop.color }} />
                      <span className="font-semibold text-zinc-700">{crop.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 font-medium">
                      <span className="font-bold text-zinc-800">{crop.value}%</span>
                      <span>• ₹{crop.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Price Trends & Orders Funnel */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">

        {/* Price Trends Chart */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[16px] flex items-center gap-2">
              📈 Price Trends <span className="text-zinc-400 font-medium text-[13px]">• Bhopal Mandi</span>
            </h3>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceTrendsData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#71717A' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#A1A1AA' }}
                  tickFormatter={(v) => `₹${v}`}
                  domain={[20, 60]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [`₹${value}`, name]}
                />
                <Line type="monotone" dataKey="Tomato" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Wheat" stroke="#EAB308" strokeWidth={2.5} dot={{ r: 3, fill: '#EAB308', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Onion" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 3, fill: '#A855F7', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-2 px-2 text-[12px] font-medium text-zinc-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /> Tomato</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Wheat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500" /> Onion</div>
          </div>
        </div>

        {/* Orders Funnel */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[16px]">Orders Funnel</h3>
          </div>
          <div className="space-y-4">
            {orderFunnel.map((stage, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-zinc-700">{stage.label}</span>
                  <span className="font-extrabold text-zinc-900">{stage.count}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all`}
                    style={{ width: `${Math.round((stage.count / stage.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Matches & Agreements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Buyer Matches (Suggested Deals) */}
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4 flex items-center justify-between">
            Suggested Deals (Top Matches)
            <Link href="/deals" className="text-[11px] font-semibold text-emerald-600 hover:underline">View All</Link>
          </h3>
          <div className="space-y-3">
            {suggestions.length > 0 ? suggestions.slice(0, 3).map((match, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-extrabold text-[12px] shrink-0 text-blue-700 shadow-sm">
                  {match.target_name?.substring(0,2).toUpperCase() || 'BY'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 group-hover:text-emerald-700 transition-colors">{match.target_name}</div>
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
