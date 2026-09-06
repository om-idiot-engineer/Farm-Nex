"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Truck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Image as ImageIcon,
  CloudRain,
  Sun,
  Search,
  ChevronRight,
  TrendingDown,
  Calendar,
  IndianRupee,
  PackageCheck,
  BellRing
} from "lucide-react";
import type { CropListing } from "@/lib/api";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFarmerListings, getAgreements } from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const mockSalesData = [
  { name: 'May', sales: 40000 },
  { name: 'Jun', sales: 60000 },
  { name: 'Jul', sales: 85000 },
  { name: 'Aug', sales: 55000 },
];

export default function FarmerHomePage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsRes, agreementsRes] = await Promise.all([
        getFarmerListings(),
        getAgreements(),
      ]);
      setListings(listingsRes?.data || []);
      setAgreements(agreementsRes?.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadData();
  }, [hasAccess, user]);

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const activeAgreements = agreements.filter((a) => a.status !== "completed");
  const pendingActions = activeAgreements.filter((a) => a.status === "matched" || a.status === "trade_confirmed").length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header & Greeting */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">
          Good afternoon, {user?.name?.split(' ')[0] || 'Farmer'} 👋
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">
          Here&apos;s what matters on your farm today.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Column (Left) */}
        <div className="xl:col-span-8 space-y-12">

          {/* Section 1 — Today / Attention */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <BellRing className="h-5 w-5 text-rose-600" />
              <h2 className="text-lg font-bold text-foreground">Needs Your Attention</h2>
            </div>

            <div className="space-y-4">
              {pendingActions > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl gap-4 transition-all hover:shadow-md">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                      1 order is waiting for confirmation
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                      Buyer requested 500Q soybean. Confirm to proceed with the trade.
                    </p>
                  </div>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 shadow-sm ml-4 sm:ml-0">
                    Review Order
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border rounded-2xl gap-4 transition-all hover:border-primary/30 hover:shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Your farm profile is 80% complete
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    Add harvest photos to improve buyer trust and get 3x more views.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 shadow-sm ml-6 sm:ml-0 font-semibold border-border">
                  Complete Profile
                </Button>
              </div>
            </div>
          </section>

          {/* Section 2 — Opportunities for You */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-6">Opportunities for you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Opportunity Card 1 */}
              <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:shadow-md hover:border-primary/40 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="h-16 w-16 text-primary" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                  🔥 High Demand
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground leading-tight">
                  Wheat demand is up 23% near Indore
                </h3>
                <p className="text-sm text-muted-foreground mt-3 font-medium">
                  4 verified buyers are currently looking for premium quality.
                </p>
                <div className="mt-6 flex items-center text-primary font-bold group-hover:underline">
                  Find Buyers <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Opportunity Card 2 */}
              <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:shadow-md hover:border-primary/40 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IndianRupee className="h-16 w-16 text-primary" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Price Alert
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground leading-tight">
                  Soybean prices increased 6.2%
                </h3>
                <p className="text-sm text-muted-foreground mt-3 font-medium">
                  Current market range ₹4,500–₹4,700/Q. Good time to list.
                </p>
                <div className="mt-6 flex items-center text-primary font-bold group-hover:underline">
                  View Market <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 — My Produce */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">My Produce</h2>
              <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/10">
                <Plus className="h-4 w-4 mr-1.5" /> Add Crop
              </Button>
            </div>

            <div className="space-y-4">
              {/* Produce Item 1 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-card border border-border rounded-2xl hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Sprout className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Wheat <span className="text-sm font-normal text-muted-foreground ml-2">Sharbati</span></h3>
                    <p className="text-sm font-semibold text-foreground mt-1">1,200 Q available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated value ₹29.0L</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      ₹2,420/Q
                      <span className="flex items-center text-xs text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-bold">
                        <TrendingUp className="h-3 w-3 mr-0.5" /> 4.2%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="mt-0 md:mt-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm">
                    Find Buyers
                  </Button>
                </div>
              </div>

              {/* Produce Item 2 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-card border border-border rounded-2xl hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Sprout className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Soybean <span className="text-sm font-normal text-muted-foreground ml-2">JS 9560</span></h3>
                    <p className="text-sm font-semibold text-foreground mt-1">2,500 Q available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated value ₹1.15Cr</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      ₹4,620/Q
                      <span className="flex items-center text-xs text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-bold">
                        <TrendingUp className="h-3 w-3 mr-0.5" /> 2.1%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="mt-0 md:mt-3 font-semibold shadow-sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Orders */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Active Orders</h2>
              <Button variant="link" size="sm" className="text-primary font-semibold pr-0">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">#FN2841 • 500 Q Wheat</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Buyer: <span className="text-foreground">ABC Foods</span></p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">₹12.1L</p>
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-flex mt-1">Payment Escrowed</p>
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="relative pt-6 pb-2">
                <div className="absolute top-8 left-4 right-4 h-0.5 bg-muted"></div>
                <div className="absolute top-8 left-4 w-1/3 h-0.5 bg-primary"></div>

                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-card z-10"></div>
                    <span className="text-xs font-semibold text-foreground mt-3">Order Received</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-card z-10"></div>
                    <span className="text-xs font-semibold text-foreground mt-3">Buyer Confirmed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-muted border-2 border-border ring-4 ring-card z-10"></div>
                    <span className="text-xs font-medium text-muted-foreground mt-3">Dispatch</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-muted border-2 border-border ring-4 ring-card z-10"></div>
                    <span className="text-xs font-medium text-muted-foreground mt-3">Delivery</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <Button size="sm" variant="outline" className="font-semibold shadow-sm">
                  Review Details
                </Button>
              </div>
            </div>
          </section>

        </div>

        {/* Side Column (Right) */}
        <div className="xl:col-span-4 space-y-8">

          {/* Farm Profile */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-primary/5"></div>

            <div className="relative flex flex-col items-center text-center mt-6">
              <div className="h-20 w-20 bg-background border-4 border-card text-primary rounded-2xl flex items-center justify-center font-serif font-bold text-3xl shadow-sm mb-4">
                {user?.name?.[0]?.toUpperCase() || 'F'}
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground">My Farm</h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1.5 font-medium">
                <MapPin className="h-4 w-4" /> Indore, Madhya Pradesh
              </p>

              <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mt-4 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Farmer
              </div>
            </div>

            <div className="space-y-4 text-sm mt-8">
              <div>
                <div className="flex justify-between mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Profile Completion</span>
                  <span className="text-foreground">80%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Current Season</span>
                <span className="font-bold text-foreground">Kharif</span>
              </div>

              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Total Area</span>
                <span className="font-bold text-foreground">12 Acres</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full font-bold shadow-sm" variant="default">
                Complete Profile
              </Button>
              <Button variant="outline" className="w-full text-muted-foreground font-semibold border-border">
                <ImageIcon className="h-4 w-4 mr-2" /> Add Farm Photos
              </Button>
            </div>
          </div>

          {/* Section 7 — Sales / Earnings */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6">Financials</h2>

            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Sales this season</p>
              <p className="text-3xl font-serif font-bold text-foreground">₹2.4L</p>
            </div>

            <div className="flex justify-between gap-4 mb-6">
              <div className="flex-1 p-3 bg-muted/50 rounded-xl">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Received</p>
                <p className="text-lg font-bold text-foreground">₹1.98L</p>
              </div>
              <div className="flex-1 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Pending</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">₹42K</p>
              </div>
            </div>

            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSalesData}>
                  <Tooltip
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{r: 4, fill: 'var(--card)', strokeWidth: 2}}
                    activeDot={{r: 6, fill: 'var(--primary)'}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground font-medium mt-2">Revenue Trend (May - Aug)</p>
          </div>

          {/* Section 3 — Farm Conditions */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Conditions</p>
              <div className="flex items-center gap-3">
                <Sun className="h-10 w-10 text-amber-500" />
                <div>
                  <p className="text-2xl font-serif font-bold text-foreground">28°C</p>
                  <p className="text-sm font-medium text-muted-foreground">Mostly clear</p>
                </div>
              </div>
              <p className="text-xs font-medium text-primary mt-3 bg-primary/10 px-2 py-1 rounded inline-block">
                Good conditions for harvesting
              </p>
            </div>
            <div className="text-right flex flex-col justify-between h-full">
              <div className="flex items-center text-xs font-bold text-blue-500 gap-1 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
                <CloudRain className="h-3.5 w-3.5" /> 12% Rain
              </div>
            </div>
          </div>

          {/* Section 6 — Market Intelligence */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Market Prices</h2>
              <Button variant="link" size="sm" className="text-muted-foreground font-semibold pr-0 hover:text-primary">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Wheat</p>
                  <p className="text-xs text-muted-foreground">Mandi: Indore</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹2,420/Q</p>
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-end"><TrendingUp className="h-3 w-3 mr-0.5" /> 4.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Soybean</p>
                  <p className="text-xs text-muted-foreground">Mandi: Dewas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹4,620/Q</p>
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-end"><TrendingUp className="h-3 w-3 mr-0.5" /> 2.1%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Onion</p>
                  <p className="text-xs text-muted-foreground">Mandi: Ujjain</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹1,840/Q</p>
                  <p className="text-xs font-bold text-rose-600 flex items-center justify-end"><TrendingDown className="h-3 w-3 mr-0.5" /> 1.3%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
