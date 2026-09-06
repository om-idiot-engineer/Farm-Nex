"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  ShieldCheck,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Truck,
  MessageSquare,
} from "lucide-react";
import type { CropListing } from "@/lib/api";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import {
  getFarmerListings,
  getAgreements,
  getNetworkPosts,
} from "@/lib/services/domain";
import type { ExtendedTradeAgreement, NetworkPost } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";

export default function FarmerHomePage() {
  const router = useRouter();
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsRes, agreementsRes, postsRes] = await Promise.all([
        getFarmerListings(),
        getAgreements(),
        getNetworkPosts()
      ]);
      setListings(listingsRes.data);
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

  return (
    <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Compact Business Snapshot */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-primary/20 h-16 w-full" />
          <div className="px-4 pb-4 -mt-8">
            <div className="flex justify-between items-end mb-2">
              <div className="h-16 w-16 bg-card border-4 border-card rounded-xl flex items-center justify-center overflow-hidden">
                <div className="h-full w-full bg-primary/20 text-primary flex items-center justify-center font-black text-2xl">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            <h1 className="text-base font-black text-foreground tracking-tight">{user.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              Verified Farmer
            </p>
            <div className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Listings</span>
                <span className="font-bold text-foreground">{listings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Orders</span>
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
               <Link href="/farmer/produce/new"><Plus className="mr-2 h-4 w-4 text-primary" /> List Produce</Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start font-bold">
               <Link href="/farmer/buyers"><TrendingUp className="mr-2 h-4 w-4 text-emerald-600" /> Find Buyers</Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start font-bold">
               <Link href="/orders"><Truck className="mr-2 h-4 w-4 text-blue-600" /> View Orders</Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Middle Column: Feed */}
      <div className="lg:col-span-6 space-y-4">
        {/* Post Composer area simplified */}
        <div className="bg-card border border-border rounded-xl shadow-xs p-4 flex gap-3 items-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => router.push('/network')}>
           <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold shrink-0">
             {user.name[0]}
           </div>
           <div className="flex-1 bg-muted/40 hover:bg-muted/70 transition-colors rounded-full px-4 py-2.5 text-sm text-muted-foreground font-medium border border-border/60">
             Share an update, harvest detail, or ask a question...
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
             <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Agricultural Feed</h2>
             <span className="text-[10px] font-semibold text-muted-foreground">Sorted by Relevance</span>
          </div>
          {posts.map((post) => (
             <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))}
          {posts.length === 0 && (
             <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-card">
               No recent activity in your network.
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Discover */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl shadow-xs p-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Market Opportunities</h2>
          <div className="space-y-3">
             <div className="p-3 bg-muted/30 border border-border/50 rounded-lg">
                <p className="text-sm font-bold text-foreground">Wheat Demand Up</p>
                <p className="text-xs text-muted-foreground mt-1 mb-2">Processors in MP are seeking premium Sharbati wheat.</p>
                <Link href="/farmer/buyers" className="text-xs font-bold text-primary flex items-center hover:underline">
                  View Buyers <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
             </div>
             <div className="p-3 bg-muted/30 border border-border/50 rounded-lg">
                <p className="text-sm font-bold text-foreground">Fertilizer Subsidies</p>
                <p className="text-xs text-muted-foreground mt-1 mb-2">New govt scheme announced for organic farmers.</p>
                <Link href="/network" className="text-xs font-bold text-primary flex items-center hover:underline">
                  Join Discussion <MessageSquare className="h-3 w-3 ml-1" />
                </Link>
             </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-xs p-4 flex flex-col items-center text-center">
           <ShieldCheck className="h-8 w-8 text-emerald-600 mb-2" />
           <p className="text-sm font-bold">Secure Trades</p>
           <p className="text-xs text-muted-foreground mt-1 mb-3">All your accepted orders are protected by FarmNex Escrow.</p>
           <TrustBadge type="producer" size="sm" />
        </div>
      </div>
    </div>
  );
}
