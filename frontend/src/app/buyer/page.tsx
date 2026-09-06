"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Search, 
  PlusCircle, 
  TrendingUp, 
  FileText,
  MessageSquare,
  ShieldCheck,
  Truck,
  ArrowRight
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { 
  getProcurementRequirements,
  getAgreements,
  getNetworkPosts,
  getMarketListings
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement, NetworkPost } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import PostCard from "@/components/PostCard";

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["buyer", "admin"]);
  const [rfqs, setRfqs] = useState(() => getProcurementRequirements().data);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [supply, setSupply] = useState(getMarketListings().data.slice(0, 3));
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreementsRes, postsRes] = await Promise.all([
        getAgreements(),
        getNetworkPosts("procurement")
      ]);
      setAgreements(agreementsRes.data);
      setPosts(postsRes.data);
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
    <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Compact Business Snapshot */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-blue-100 dark:bg-blue-900/30 h-16 w-full" />
          <div className="px-4 pb-4 -mt-8">
            <div className="flex justify-between items-end mb-2">
              <div className="h-16 w-16 bg-card border-4 border-card rounded-xl flex items-center justify-center overflow-hidden">
                <div className="h-full w-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-2xl">
                  {user.buyer_profile?.business_name?.[0] || user.name[0]}
                </div>
              </div>
            </div>
            <h1 className="text-base font-black text-foreground tracking-tight">{user.buyer_profile?.business_name || user.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              Verified Bulk Buyer
            </p>
            <div className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active RFQs</span>
                <span className="font-bold text-foreground">{rfqs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Supplier Responses</span>
                <span className="font-bold text-foreground">{supplierResponses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Open Orders</span>
                <span className="font-bold text-foreground">{activeAgreements.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-rose-600 font-semibold">Pending Actions</span>
                <span className="font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/50 px-2 rounded-md">{pendingActions}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-xs p-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h2>
          <div className="space-y-2">
             <Button asChild variant="outline" className="w-full justify-start font-bold">
               <Link href="/buyer/procurement"><PlusCircle className="mr-2 h-4 w-4 text-primary" /> Publish RFQ</Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start font-bold">
               <Link href="/buyer/discover"><Search className="mr-2 h-4 w-4 text-blue-600" /> Find Supply Lots</Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start font-bold">
               <Link href="/orders"><Truck className="mr-2 h-4 w-4 text-emerald-600" /> Track Deliveries</Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Middle Column: Procurement Feed */}
      <div className="lg:col-span-6 space-y-4">
        {/* Post Composer area simplified */}
        <div className="bg-card border border-border rounded-xl shadow-xs p-4 flex gap-3 items-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => router.push('/network')}>
           <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-bold shrink-0">
             {user.name[0]}
           </div>
           <div className="flex-1 bg-muted/40 hover:bg-muted/70 transition-colors rounded-full px-4 py-2.5 text-sm text-muted-foreground font-medium border border-border/60">
             Post an open procurement requirement to the network...
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
             <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Procurement Network</h2>
             <span className="text-[10px] font-semibold text-muted-foreground">Filtered for Buyers</span>
          </div>
          {posts.map((post) => (
             <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))}
          {posts.length === 0 && (
             <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-card">
               No recent procurement activity in your network.
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Recommended Supply */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl shadow-xs p-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Recommended Supply</h2>
          <div className="space-y-3">
             {supply.map(lot => (
                <div key={lot.id} className="p-3 bg-muted/30 border border-border/50 rounded-lg">
                  <p className="text-sm font-bold text-foreground">{lot.quantity}Q {lot.commodity}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">From {lot.farmer_name}, {lot.location}</p>
                  <Link href={`/marketplace/listings/${lot.id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center hover:underline">
                    View Lot <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
               </div>
             ))}
             {supply.length === 0 && (
               <p className="text-xs text-muted-foreground">No matches found.</p>
             )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-xs p-4 flex flex-col items-center text-center">
           <Building2 className="h-8 w-8 text-blue-600 mb-2" />
           <p className="text-sm font-bold">FPO Aggregation</p>
           <p className="text-xs text-muted-foreground mt-1 mb-3">Source large volumes directly from verified Farmer Producer Organizations.</p>
           <TrustBadge type="fpo" size="sm" />
        </div>
      </div>
    </div>
  );
}
