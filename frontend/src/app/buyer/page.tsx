"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  PlusCircle,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  getProcurementRequirements,
  getAgreements,
  getMarketListings
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const mockProcurementData = [
  { name: 'Jan', volume: 400 },
  { name: 'Feb', volume: 300 },
  { name: 'Mar', volume: 550 },
  { name: 'Apr', volume: 450 },
  { name: 'May', volume: 700 },
];

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const [rfqs, setRfqs] = useState(() => getProcurementRequirements().data);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [supply, setSupply] = useState(getMarketListings().data.slice(0, 4));
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreementsRes] = await Promise.all([
        getAgreements(),
      ]);
      setAgreements(agreementsRes.data);
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
  const supplierResponses = rfqs.reduce((acc, r) => acc + (r.responseCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Top Greeting */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Good morning, {user.buyer_profile?.business_name || user.name.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here’s your procurement overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Active RFQs</p>
          <p className="text-2xl font-black text-foreground">{rfqs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Supplier Responses</p>
          <p className="text-2xl font-black text-blue-600">{supplierResponses}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Open Orders</p>
          <p className="text-2xl font-black text-foreground">{activeAgreements.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-rose-600 font-semibold mb-1 uppercase tracking-wider">Pending Actions</p>
          <p className="text-2xl font-black text-rose-600">{pendingActions + 1}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Total Procurement</p>
          <p className="text-2xl font-black text-foreground">2,400 Q</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Column (Left) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Priority Actions */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-4">What needs your attention?</h2>
            <div className="space-y-3">
              {supplierResponses > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-foreground">12 supplier responses waiting</p>
                      <p className="text-xs text-muted-foreground">Review quotes for your latest Soybean RFQ.</p>
                    </div>
                  </div>
                  <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">Review Responses</Button>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="text-sm font-bold text-foreground">2 RFQs closing soon</p>
                    <p className="text-xs text-muted-foreground">Action required before they expire today.</p>
                  </div>
                </div>
                <Button size="sm" variant="default" className="bg-rose-600 hover:bg-rose-700 text-white">Manage RFQs</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-foreground">3 lots ready for inspection</p>
                    <p className="text-xs text-muted-foreground">Pending quality check at the warehouse.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule Inspection</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-foreground">1 shipment delayed</p>
                    <p className="text-xs text-muted-foreground">Order #FN1024 is running behind schedule.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Track Order</Button>
              </div>
            </div>
          </section>

          {/* Visual Analytics */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-4">Procurement Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-bold mb-4">Procurement Volume</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockProcurementData}>
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
                  <span>Jan</span>
                  <span>May</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold mb-4">Commodity Breakdown</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Soybean</span>
                        <span className="text-muted-foreground">60%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Wheat</span>
                        <span className="text-muted-foreground">30%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[30%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Maize</span>
                        <span className="text-muted-foreground">10%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[10%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Side Column (Right) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button asChild variant="default" className="w-full justify-start font-bold bg-blue-600 hover:bg-blue-700">
                <Link href="/buyer/procurement"><PlusCircle className="mr-2 h-4 w-4" /> Publish RFQ</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start font-bold text-foreground bg-muted hover:bg-muted/80">
                <Link href="/buyer/discover"><Search className="mr-2 h-4 w-4" /> Find Supply Lots</Link>
              </Button>
            </div>
          </div>

          {/* Recommended Supply */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Recommended Supply</h2>
            <div className="space-y-4">
              {supply.map(lot => (
                <div key={lot.id} className="group border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-foreground">{lot.quantity}Q {lot.commodity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lot.farmer_name}</p>
                      <p className="text-xs text-muted-foreground">{lot.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600">Verified</p>
                      <p className="text-xs font-bold text-foreground mt-1">₹{lot.expected_price}/Q</p>
                    </div>
                  </div>
                  <Link href={`/marketplace/listings/${lot.id}`} className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 mt-2">
                    View Lot <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
              {supply.length === 0 && (
                <p className="text-sm text-muted-foreground">No matches found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
