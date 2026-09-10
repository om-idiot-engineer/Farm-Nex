"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Send,
  ArrowRight,
  TrendingUp,
  Tag,
  HelpCircle,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { NetworkPost } from "@/lib/data/demo";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface PostCardProps {
  post: NetworkPost;
  currentUserId?: string;
  onReact?: (postId: string) => void;
  onReply?: (postId: string, content: string) => Promise<void>;
}

export default function PostCard({ post, currentUserId, onReact, onReply }: PostCardProps) {
  const { t } = useTranslation();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || 0);
  const [hasReacted, setHasReacted] = useState(false);

  const handleReact = () => {
    if (!hasReacted) {
      setReactions((r) => r + 1);
      setHasReacted(true);
      onReact?.(post.id);
    } else {
      setReactions((r) => Math.max(0, r - 1));
      setHasReacted(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply?.(post.id, replyText.trim());
      setReplyText("");
      setShowReplyBox(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const topicConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    harvest: { label: "Harvest Update", bg: "bg-emerald-50", text: "text-emerald-900 border-emerald-200", icon: Sparkles },
    procurement: { label: "Buyer Requirement", bg: "bg-blue-50", text: "text-blue-900 border-blue-200", icon: TrendingUp },
    market: { label: "Market Intelligence", bg: "bg-amber-50", text: "text-amber-900 border-amber-200", icon: TrendingUp },
    question: { label: "Agronomy Q&A", bg: "bg-sky-50", text: "text-sky-900 border-sky-200", icon: HelpCircle },
    machinery: { label: "Machinery & Logistics", bg: "bg-orange-50", text: "text-orange-900 border-orange-200", icon: Wrench },
    expert: { label: "Verified Advisory", bg: "bg-purple-50", text: "text-purple-900 border-purple-200", icon: ShieldCheck },
    logistics: { label: "Logistics Hub", bg: "bg-teal-50", text: "text-teal-900 border-teal-200", icon: MapPin },
  };

  const topic = topicConfig[post.topic] || {
    label: post.tag || "General",
    bg: "bg-muted/40",
    text: "text-foreground border-border",
    icon: Tag,
  };
  const TopicIcon = topic.icon;

  const trustType =
    post.author_role === "buyer"
      ? "buyer"
      : post.author_role === "fpo"
      ? "fpo"
      : post.author_role === "expert" || post.expert_verified
      ? "expert"
      : "producer";

  return (
    <article className="border border-border bg-card rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Post Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              href={`/profile/${post.user_id}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shrink-0 hover:opacity-90"
            >
              {post.author_name.slice(0, 2).toUpperCase()}
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${post.user_id}`}
                  className="font-bold text-foreground hover:text-primary transition-colors text-sm"
                >
                  {post.author_name}
                </Link>
                <TrustBadge type={trustType} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="capitalize">{post.author_role}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-primary" />
                      {post.location}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${topic.bg} ${topic.text}`}
            >
              <TopicIcon className="h-3 w-3" />
              {topic.label}
            </span>
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                isFollowing
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {isFollowing ? t("network.following", "Following") : t("network.follow", "+ Follow")}
            </button>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{post.content}</p>

        {/* Post Media Carousel */}
        {post.images && post.images.length > 0 && (
          <div className="relative mt-3 rounded-lg overflow-hidden border border-border bg-muted/20 flex gap-2 overflow-x-auto snap-x py-2 px-2 hide-scrollbar">
            {post.images.map((img: string, idx: number) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Media ${idx}`} 
                className="h-48 w-auto object-cover rounded-md snap-center shrink-0 border border-border shadow-sm"
              />
            ))}
          </div>
        )}


        {/* Structured Spec Pill / Callout with Commerce Action */}
        <div className="bg-muted/30 border border-border p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {post.quantitySpec ? (
              <span className="bg-card border border-border px-2.5 py-1 rounded font-bold text-foreground">
                {post.quantitySpec}
              </span>
            ) : (
              <span className="bg-card border border-border px-2.5 py-1 rounded font-semibold text-muted-foreground">
                Agricultural Post
              </span>
            )}
            {post.targetPrice && (
              <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded font-bold">
                Benchmark: {post.targetPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {post.actionHref && post.actionText ? (
              <Button size="sm" variant="outline" asChild className="h-7 text-xs font-bold">
                <Link href={post.actionHref}>
                  {post.actionText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            ) : post.topic === "procurement" ? (
              <Button size="sm" variant="outline" asChild className="h-7 text-xs font-bold">
                <Link href="/marketplace?mode=demand">
                  View Demand RFQ
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            ) : post.topic === "harvest" ? (
              <Button size="sm" variant="outline" asChild className="h-7 text-xs font-bold">
                <Link href="/marketplace?mode=supply">
                  Inspect Harvest Lot
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-bold text-primary">
                <Link href={`/messages?recipientId=${post.user_id}`}>
                  Message
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Post Actions Toolbar */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReact}
              className={`flex items-center gap-1.5 transition-colors ${
                hasReacted ? "text-rose-600 font-bold" : "hover:text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${hasReacted ? "fill-current" : ""}`} />
              <span>{reactions}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.replies?.length || post.comments || 0} {t("repliesCount", "answers")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin + `/network/${post.id}`);
                alert("Post link copied to clipboard!");
              }}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              title={t("common.share", "Share post")}
            >
              <Share2 className="h-4 w-4" />
              <span>{t("common.share", "Share")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`p-1 transition-colors ${isSaved ? "text-primary" : "hover:text-foreground"}`}
            title={isSaved ? "Saved" : "Save post"}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Expandable Reply Section */}
        {showReplyBox && (
          <div className="pt-3 border-t border-border space-y-3 bg-muted/10 -mx-5 px-5 pb-2">
            {/* Existing replies */}
            {post.replies && post.replies.length > 0 && (
              <div className="space-y-2.5">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="bg-card border border-border p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{reply.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Input */}
            <form onSubmit={handleSendReply} className="flex gap-2 pt-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("writeReply", "Share your agronomic advice or reply...")}
                className="min-w-0 flex-1 border border-input bg-card px-3 py-1.5 text-xs rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" type="submit" disabled={!replyText.trim() || isSubmitting} className="h-8 text-xs font-bold">
                <Send className="h-3 w-3 mr-1" />
                {t("postReply", "Reply")}
              </Button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
