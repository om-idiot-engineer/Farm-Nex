"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import {
  createNetworkPost,
  getNetworkPosts,
  replyToPost,
  togglePostReaction,
  type DataSource,
} from "@/lib/services/domain";
import type { NetworkPost } from "@/lib/data/demo";
import PostCard from "@/components/PostCard";
import DemoNotice from "@/components/DemoNotice";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import {
  UsersRound,
  Plus,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Wrench,
  ShieldCheck,
  Send,
  MapPin,
  ArrowRight,
  Filter,
  CheckCircle2, Truck,
  Building2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type FeedFilter = "all" | "market" | "demand" | "supply" | "farm update" | "question" | "knowledge" | "machinery" | "logistics" | "success story";

export default function NetworkFeedPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  // Post composer state
  const [showComposer, setShowComposer] = useState(false);
  const [topic, setTopic] = useState<NetworkPost["topic"]>("harvest");
  const [content, setContent] = useState("");
  const [quantitySpec, setQuantitySpec] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const result = await getNetworkPosts(activeFilter === "all" ? undefined : activeFilter);
      setPosts(result.data);
      setSource(result.source);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load network feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const result = await createNetworkPost(
        {
          tag: topic === "expert" ? "expert_verified" : topic === "machinery" ? "machinery" : "market",
          topic,
          content: content.trim(),
          quantitySpec: quantitySpec.trim() || undefined,
          targetPrice: targetPrice.trim() || undefined,
        },
        user
      );
      setPosts([result.data, ...posts]);
      setContent("");
      setQuantitySpec("");
      setTargetPrice("");
      setShowComposer(false);
    } catch (err: any) {
      alert(err.message || "Could not publish post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId: string, replyText: string) => {
    if (!user) {
      router.push("/");
      return;
    }
    await replyToPost(postId, replyText, user);
    loadPosts();
  };

  const handleReact = async (postId: string) => {
    await togglePostReaction(postId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <UsersRound className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              {t("communityTitle", "Agricultural Professional Feed")}
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">{t("network.feedTitle", "Network & Discussions")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Verified harvest updates, buyer sourcing tenders, machinery rentals, and expert agronomic advisories.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!user) {
              router.push("/");
              return;
            }
            setShowComposer(!showComposer);
          }}
          className="font-bold shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Share Update
        </Button>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Network discussions and updates are stored in your local browser sandbox when the live community service is not active.
        </DemoNotice>
      )}

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Identity & Topic Filters */}
        <aside className="lg:col-span-3 space-y-5">
          {/* User mini badge */}
          {user ? (
            <div className="border border-border bg-card rounded-lg p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground">
                  {user.farmer_profile?.location || user.buyer_profile?.location || "Madhya Pradesh"}
                </span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold" asChild>
                <Link href={`/profile/${user.id}`}>View My Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="border border-border bg-card rounded-lg p-4 space-y-3 shadow-sm text-center">
              <p className="text-xs font-bold text-foreground">Join the Agricultural Network</p>
              <p className="text-[11px] text-muted-foreground">Sign in to connect with farmers, agronomists, and bulk buyers.</p>
              <Button size="sm" className="w-full font-bold" asChild>
                <Link href="/">Sign in</Link>
              </Button>
            </div>
          )}

          {/* Filter Categories */}
          <div className="border border-border bg-card rounded-lg p-3 space-y-1 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 py-1.5">
              Feed Channels
            </p>
            {[
              { id: "all", label: "For You (All)", icon: UsersRound },
              { id: "market", label: "Market", icon: TrendingUp },
              { id: "demand", label: "Demand", icon: Building2 },
              { id: "supply", label: "Supply", icon: Sparkles },
              { id: "farm update", label: "Farm Update", icon: UsersRound },
              { id: "question", label: "Question", icon: HelpCircle },
              { id: "knowledge", label: "Knowledge", icon: ShieldCheck },
              { id: "machinery", label: "Machinery", icon: Wrench },
              { id: "logistics", label: "Logistics", icon: Truck },
              { id: "success story", label: "Success Story", icon: CheckCircle2 },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as FeedFilter)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: Composer & Feed */}
        <main className="lg:col-span-6 space-y-5">
          {/* Collapsible Composer */}
          {showComposer && (
            <div className="border border-border bg-card rounded-lg p-5 shadow-md space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  {t("network.publishPost", "Publish to Network")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("common.cancel", "Cancel")}
                </button>
              </div>

              {/* Topic Select */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "harvest", label: t("tagHarvest", "Harvest Update") },
                  { id: "procurement", label: t("marketplace.buyerDemands", "Buyer Requirement") },
                  { id: "question", label: t("network.questions", "Ask Question") },
                  { id: "market", label: t("tagMarket", "Market Note") },
                  { id: "machinery", label: t("tagMachinery", "Machinery Rental") },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTopic(t.id as any)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      topic === t.id
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    topic === "harvest"
                      ? "Describe your harvest progress, moisture reading, and available quintals..."
                      : topic === "procurement"
                      ? "Specify crop, required grade, destination mill, and target price range..."
                      : topic === "question"
                      ? "Ask verified agronomists and peer farmers a question..."
                      : t("network.shareUpdate", "Share an agricultural update...")
                  }
                  className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                />

                {/* Additional Spec Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={quantitySpec}
                    onChange={(e) => setQuantitySpec(e.target.value)}
                    placeholder="Volume spec (e.g. 250Q Available)"
                    className="p-2 border border-input rounded bg-background outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Target price (e.g. ₹5,350/q)"
                    className="p-2 border border-input rounded bg-background outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={!content.trim() || submitting}
                    className="font-bold text-xs"
                  >
                    <Send className="h-3 w-3 mr-1.5" />
                    {submitting ? "Publishing..." : "Post to Network"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Feed List */}
          {errorMsg ? (
            <ErrorState message={errorMsg} onRetry={loadPosts} />
          ) : loading ? (
            <LoadingSkeleton variant="card" rows={4} />
          ) : posts.length ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onReact={handleReact}
                  onReply={handleReply}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border bg-card rounded-lg p-10 text-center space-y-3">
              <UsersRound className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-bold text-foreground">No posts found in this category</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Be the first to share an agricultural update, harvest note, or inquiry with the community.
              </p>
              <Button size="sm" onClick={() => setShowComposer(true)} className="font-bold">
                Create First Post
              </Button>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Market Alerts & Recommended Contacts */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Mandi Snapshot Widget */}
          <div className="border border-border bg-card rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Mandi Benchmark
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                +1.8% 7d
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Soybean (Yellow)</p>
              <p className="text-2xl font-black text-foreground">₹5,420<span className="text-xs font-normal text-muted-foreground">/q</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Indore & Dewas average</p>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs font-semibold" asChild>
              <Link href="/intelligence">Full Market Trends</Link>
            </Button>
          </div>

          {/* Nearby Buyer Demand Callout */}
          <div className="border border-border bg-card rounded-lg p-4 space-y-2.5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Active Buyer Requirement
            </span>
            <h4 className="text-xs font-bold text-foreground">Agrocorp Central Processing</h4>
            <p className="text-xs text-muted-foreground">
              Seeking 500Q Grade A soybean at ₹5,350/q with buyer pickup in Dewas.
            </p>
            <Button size="sm" className="w-full text-xs font-bold" asChild>
              <Link href="/marketplace/requirements/demo-demand-agrocorp-500">
                View Requirement
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* Verified Contacts to Follow */}
          <div className="border border-border bg-card rounded-lg p-4 space-y-3 shadow-sm text-xs">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Suggested Agricultural Contacts
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Link href="/profile/demo-expert-dr-kavita" className="font-bold text-foreground hover:underline block">
                    Dr. Kavita Rao
                  </Link>
                  <p className="text-[11px] text-muted-foreground">Agronomist · Indore</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5">
                  Follow
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <Link href="/profile/demo-fpo-malwa" className="font-bold text-foreground hover:underline block">
                    Malwa Kisan FPO
                  </Link>
                  <p className="text-[11px] text-muted-foreground">248 Smallholders · Rau</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
