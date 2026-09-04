"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, MessageSquare, Send, Heart, Share2, Bookmark } from "lucide-react";
import { useUser } from "@/lib/auth/UserContext";
import { getPostDetail, replyToPost, togglePostReaction, type DataSource } from "@/lib/services/domain";
import type { NetworkPost } from "@/lib/data/demo";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function NetworkPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<NetworkPost | null>(null);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);

  const loadPost = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPostDetail(id);
      setPost(result.data);
      setReactions(result.data.reactions || 0);
      setSource(result.source);
    } catch (err: any) {
      setError(err.message || "We could not load this discussion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const submitReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyText.trim() || !user) return;

    setSending(true);
    try {
      const result = await replyToPost(id, replyText.trim(), user);
      if (post) {
        setPost({
          ...post,
          replies: [...(post.replies || []), result.data],
          comments: (post.comments || 0) + 1,
        });
      }
      setReplyText("");
    } catch (err: any) {
      setError(err.message || "We could not publish your response.");
    } finally {
      setSending(false);
    }
  };

  const handleReact = async () => {
    if (!hasReacted) {
      setReactions((r) => r + 1);
      setHasReacted(true);
      await togglePostReaction(id);
    } else {
      setReactions((r) => Math.max(0, r - 1));
      setHasReacted(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="detail" />;
  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <ErrorState message={error || "Post not found."} onRetry={loadPost} />
      </div>
    );
  }

  const trustType =
    post.author_role === "buyer"
      ? "buyer"
      : post.author_role === "fpo"
      ? "fpo"
      : post.author_role === "expert" || post.expert_verified
      ? "expert"
      : "producer";

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <Button variant="outline" size="sm" asChild>
        <Link href="/network">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Network Feed
        </Link>
      </Button>

      {source === "demo" && (
        <DemoNotice>
          This discussion is preserved in the local browser state.
        </DemoNotice>
      )}

      {/* Main Post Card */}
      <article className="border border-border bg-card rounded-lg shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              href={`/profile/${post.user_id}`}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-base shrink-0"
            >
              {post.author_name.slice(0, 2).toUpperCase()}
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${post.user_id}`}
                  className="font-bold text-foreground hover:text-primary transition-colors text-base"
                >
                  {post.author_name}
                </Link>
                <TrustBadge type={trustType} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
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
                <span>{new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
            {post.topic}
          </span>
        </div>

        <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
          {post.content}
        </p>

        {(post.quantitySpec || post.targetPrice) && (
          <div className="bg-muted/30 border border-border p-3 rounded-lg flex items-center gap-4 text-xs font-bold">
            {post.quantitySpec && <span>Volume: {post.quantitySpec}</span>}
            {post.targetPrice && <span className="text-primary">Target: {post.targetPrice}</span>}
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleReact}
              className={`flex items-center gap-1.5 transition-colors ${
                hasReacted ? "text-rose-600 font-bold" : "hover:text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${hasReacted ? "fill-current" : ""}`} />
              <span>{reactions} likes</span>
            </button>

            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>{post.replies?.length || 0} responses</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Link copied!");
            }}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </article>

      {/* Answers / Comments Section */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Answers & Peer Discussions ({post.replies?.length || 0})
        </h2>

        {/* Composer Form */}
        <form onSubmit={submitReply} className="border border-border bg-card rounded-lg p-4 space-y-3 shadow-sm">
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={user ? "Write your agronomic guidance, price insight, or comment..." : "Sign in to post a reply"}
            disabled={!user}
            className="w-full p-3 border border-input rounded bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {user ? `Replying as ${user.name}` : "You must be signed in"}
            </span>
            <Button size="sm" type="submit" disabled={!replyText.trim() || sending || !user} className="font-bold">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {sending ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </form>

        {/* Replies List */}
        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-3">
            {post.replies.map((r) => (
              <div key={r.id} className="border border-border bg-card rounded-lg p-4 space-y-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{r.author_name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                      {r.author_role}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{r.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-6 rounded-lg text-center text-xs text-muted-foreground">
            No replies yet. Be the first to share your experience on this topic.
          </div>
        )}
      </section>
    </div>
  );
}
