"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { useUser } from "@/lib/auth/UserContext";
import { createNetworkPost, getNetworkPosts, replyToPost, type DataSource } from "@/lib/services/domain";
import type { NetworkPost } from "@/lib/data/demo";
import TrustBadge from "@/components/TrustBadge";
import DemoNotice from "@/components/DemoNotice";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  Users,
  MessageSquare,
  Plus,
  ArrowLeft,
  Send,
  Filter,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Truck,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function CommunityPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [activeTag, setActiveTag] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTag, setNewTag] = useState<"question" | "market" | "machinery">("question");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active Reply input map: postId -> reply text
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await getNetworkPosts(activeTag);
      setPosts(result.data);
      setSource(result.source);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load community discussions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeTag]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (!user) {
      router.push("/");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createNetworkPost({
        tag: newTag,
        content: newContent.trim(),
        topic: newTag,
      }, user);
      setPosts([result.data, ...posts]);
      setSource(result.source);
      setNewContent("");
      setShowNewPostModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (postId: string) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;
    if (!user) {
      router.push("/");
      return;
    }

    setReplyingPostId(postId);
    try {
      const result = await replyToPost(postId, text, user);
      const reply = result.data;
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              replies: [...(p.replies || []), reply],
            };
          }
          return p;
        })
      );
      setSource(result.source);
      setReplyInputs({ ...replyInputs, [postId]: "" });
    } catch (err: any) {
      alert(err.message || "Failed to post reply.");
    } finally {
      setReplyingPostId(null);
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case "question":
        return <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">🌾 {t("tagQuestion")}</span>;
      case "market":
        return <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">📈 {t("tagMarket")}</span>;
      case "machinery":
        return <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">🚜 {t("tagMachinery")}</span>;
      case "expert_verified":
        return <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">⭐ {t("tagExpert")}</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">{tag}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-serif">
            {t("communityTitle")}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Peer knowledge sharing, mandi harvest updates, and expert-verified agronomist solutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPostModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("askQuestion")}</span>
        </button>
      </div>

      {source === "demo" && <DemoNotice>Network posts and replies are demo records unless your backend is connected. New demo posts stay in this browser.</DemoNotice>}

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadPosts} />}

      {/* Filter Tag Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        <span className="text-zinc-400 flex items-center gap-1 shrink-0 text-xs">
          <Filter className="w-3.5 h-3.5" />
          <span>Topics:</span>
        </span>

        {[
          { id: "all", label: t("allTags") },
          { id: "question", label: `🌾 ${t("tagQuestion")}` },
          { id: "market", label: `📈 ${t("tagMarket")}` },
          { id: "machinery", label: `🚜 ${t("tagMachinery")}` },
          { id: "expert_verified", label: `⭐ ${t("tagExpert")}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTag(tab.id)}
            className={`px-3 py-1.5 rounded-xl border transition shrink-0 ${
              activeTag === tab.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 font-serif">
                {t("askQuestion")}
              </h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Select Topic Tag
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "question", label: "🌾 Question" },
                    { id: "market", label: "📈 Market" },
                    { id: "machinery", label: "🚜 Machinery" },
                  ].map((tItem) => (
                    <button
                      type="button"
                      key={tItem.id}
                      onClick={() => setNewTag(tItem.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        newTag === tItem.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Discussion Content / Question *
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share a harvest query, moisture management question, or mandi arrival tip..."
                  className="w-full p-3 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Submit Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts Feed */}
        {loading ? (
        <LoadingSkeleton rows={3} />
      ) : posts.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border-2 border-dashed border-zinc-200 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800">No discussions found</h3>
          <p className="text-xs text-zinc-500">
            Be the first to ask a farming question or share market updates!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4 hover:border-zinc-300 transition"
            >
              {/* Post Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {post.author_name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                        {post.author_name}
                      </span>
                      {post.expert_verified && <TrustBadge type="expert" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 capitalize">
                      {post.author_role} • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {getTagBadge(post.tag)}
              </div>

              {/* Post Content */}
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                {post.content}
              </p>

              {/* Replies Thread */}
              {post.replies && post.replies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    {post.replies.length} {t("repliesCount")}:
                  </span>
                  <div className="space-y-2">
                    {post.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 bg-zinc-50 rounded-2xl text-xs space-y-1 border border-zinc-100"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-900">
                            {rep.author_name} ({rep.author_role})
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(rep.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-zinc-700">{rep.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input Bar */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={replyInputs[post.id] || ""}
                  onChange={(e) =>
                    setReplyInputs({ ...replyInputs, [post.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendReply(post.id);
                    }
                  }}
                  placeholder={t("writeReply")}
                  className="flex-1 px-3.5 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-zinc-50/50"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(post.id)}
                  disabled={replyingPostId === post.id || !replyInputs[post.id]?.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 transition"
                  title="Send Reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
