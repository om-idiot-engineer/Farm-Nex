"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { MoreVertical, UsersRound, Plus, Image as ImageIcon, Video, Calendar, FileText, Search, Star, Heart, MessageSquare, Share2, TrendingUp, CheckCircle2, Send, X, MapPin, Award, Play, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/UserContext";
import { getNetworkPosts, createNetworkPost, replyToPost, togglePostReaction, type NetworkPost } from "@/lib/services/domain";
import LoadingSkeleton from "@/components/LoadingSkeleton";

function NetworkContent() {
  const { user, loading: userLoading } = useUser();
  const isFarmer = user?.role === "farmer";
  const currentUser = user?.name || (isFarmer ? "Ramesh Patel" : "Ananya Foods");
  const currentRole = isFarmer ? "Organic Farmer" : "Verified Buyer";

  const [activeTab, setActiveTab] = useState("All");
  const [showComposer, setShowComposer] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [loading, setLoading] = useState(true);

  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";
  const gradientClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";

  const imageStyles = [
    { emoji: "🍅", bg: "from-red-400 to-orange-400", label: "Tomato Harvest" },
    { emoji: "🌾", bg: "from-amber-300 to-yellow-500", label: "Wheat Field" },
    { emoji: "🥔", bg: "from-orange-300 to-amber-600", label: "Potato Yield" },
    { emoji: "🥕", bg: "from-orange-400 to-red-400", label: "Carrot Farm" },
    { emoji: "🌱", bg: "from-green-300 to-emerald-500", label: "Seedling" },
    { emoji: "🚜", bg: "from-emerald-400 to-teal-500", label: "Tractor Day" }
  ];

  const loadPosts = async () => {
    try {
      const res = await getNetworkPosts(activeTab === "All" ? undefined : activeTab);
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || userLoading) return;
    loadPosts();
  }, [user, userLoading, activeTab]);

  const handlePostSubmit = async () => {
    if (!postContent.trim() || !user) return;

    try {
      const res = await createNetworkPost({
        tag: "market",
        content: postContent,
        topic: "market",
      }, user);

      if (res.data) {
        setPosts([res.data, ...posts]);
        setPostContent("");
        setShowComposer(false);
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.hasLiked || false;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !wasLiked,
          reactions: wasLiked ? (p.reactions || 0) - 1 : (p.reactions || 0) + 1
        };
      }
      return p;
    }));

    try {
      await togglePostReaction(postId);
    } catch (err) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: wasLiked,
            reactions: wasLiked ? (p.reactions || 0) + 1 : (p.reactions || 0) - 1
          };
        }
        return p;
      }));
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const currentCommentText = commentText;
    setCommentText("");

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newReply = {
          id: `reply-${Date.now()}`,
          post_id: postId,
          author_id: user.id,
          author_name: user.name,
          author_role: user.role,
          content: currentCommentText,
          created_at: new Date().toISOString(),
        };
        return {
          ...p,
          comments: (p.comments || 0) + 1,
          replies: [...(p.replies || []), newReply]
        };
      }
      return p;
    }));

    try {
      await replyToPost(postId, currentCommentText, user);
    } catch (err) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: Math.max(0, (p.comments || 0) - 1),
            replies: (p.replies || []).slice(0, -1)
          };
        }
        return p;
      }));
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (userLoading) return <LoadingSkeleton variant="detail" />;

  return (
    <div className={`bg-zinc-50 lg:bg-transparent min-h-screen ${themeClass}`}>
      {/* Mobile Top Bar */}
      <div className="bg-white border-b border-zinc-200 px-4 lg:px-6 py-3 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-extrabold tracking-tight">Kisan Network</h1>
        </div>
        <Button onClick={() => setShowComposer(true)} size="sm" className="h-8 rounded-full font-bold">
          <Plus className="w-4 h-4 mr-1" /> Post
        </Button>
      </div>

      <div className="max-w-[1128px] mx-auto lg:grid lg:grid-cols-[225px_1fr_300px] gap-6 p-0 lg:p-6">

        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block space-y-4">
          <div className="rounded-[20px] bg-white border border-zinc-200 overflow-hidden shadow-sm">
            <div className={`h-16 bg-gradient-to-r ${gradientClass}`}></div>
            <div className="p-4 -mt-10">
              <Link
                href={`/profile/${user?.id || "demo-farmer-ramesh"}`}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xl hover:scale-105 transition-transform inline-flex"
              >
                {currentUser.substring(0, 2).toUpperCase()}
              </Link>
              <div className="mt-3">
                <Link
                  href={`/profile/${user?.id || "demo-farmer-ramesh"}`}
                  className="flex items-center gap-1.5 font-bold text-[15px] hover:underline"
                >
                  {currentUser}
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </Link>
                <div className="text-[12px] text-zinc-500 leading-tight mt-1">{currentRole} • Bhopal, MP</div>
                <Link
                  href={`/profile/${user?.id || "demo-farmer-ramesh"}`}
                  className="inline-block mt-2 text-[11px] font-bold text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded-full"
                >
                  View Profile ID & Showcase →
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 text-[12px] space-y-3">
                <div className="flex justify-between hover:underline cursor-pointer">
                  <span className="text-zinc-500 font-medium">Connections</span>
                  <span className="font-bold text-blue-600">1,247</span>
                </div>
                <div className="flex justify-between hover:underline cursor-pointer">
                  <span className="text-zinc-500 font-medium">Profile views</span>
                  <span className="font-bold">342</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 text-[12px] font-medium divide-y divide-zinc-100">
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                <UsersRound className="w-4 h-4 text-zinc-400" /> My Network
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                <Calendar className="w-4 h-4 text-zinc-400" /> Events • 3 near you
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                <TrendingUp className="w-4 h-4 text-zinc-400" /> Market Insights
              </button>
            </div>
          </div>
        </div>

        {/* Main Feed Column */}
        <div className="space-y-3 lg:space-y-5">
          {/* Create Post Box */}
          <div className="bg-white border-y lg:border lg:rounded-[20px] border-zinc-200 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 shrink-0 flex items-center justify-center text-white font-bold text-[12px]">
                {currentUser.substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={() => setShowComposer(true)}
                className="flex-1 text-left px-4 h-10 rounded-full border border-zinc-300 text-[14px] text-zinc-500 hover:bg-zinc-50 font-medium transition-colors"
              >
                Start a post - Share your farming journey
              </button>
            </div>
            <div className="mt-4 flex justify-between items-center px-1">
              {[
                { icon: ImageIcon, label: "Photo", color: "text-blue-600" },
                { icon: Video, label: "Video", color: "text-green-600" },
                { icon: BarChart2, label: "Poll", color: "text-amber-600" },
                { icon: FileText, label: "Article", color: "text-red-500" }
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={() => setShowComposer(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-50 text-[13px] font-semibold transition-colors"
                >
                  <btn.icon className={`w-5 h-5 ${btn.color}`} />
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-zinc-100 rounded-[20px] animate-pulse border border-zinc-200" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-[20px] border border-zinc-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="font-bold text-[15px]">No posts yet</h3>
              <p className="text-[13px] text-zinc-500 mt-1">Be the first to share your farming journey!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white border-y lg:border lg:rounded-[20px] border-zinc-200 shadow-sm animate-in fade-in duration-300">
                <div className="p-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <Link
                      href={`/profile/${post.user_id}`}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0 hover:opacity-90 transition-opacity ${post.author_role === "expert" ? 'bg-gradient-to-br from-zinc-700 to-zinc-900' : 'bg-gradient-to-br from-orange-300 to-pink-400'}`}
                      title={`View ${post.author_name}'s Profile ID`}
                    >
                      {post.author_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'US'}
                    </Link>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/profile/${post.user_id}`}
                          className="font-bold text-[14px] hover:underline cursor-pointer tracking-tight text-zinc-900"
                        >
                          {post.author_name}
                        </Link>
                        {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 ml-0.5" />}
                      </div>
                      <div className="text-[12px] text-zinc-500 leading-tight mt-0.5">{post.author_role} • {post.location || "Madhya Pradesh"}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">{formatTime(post.created_at)}</div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-4 pb-2 text-[14px] leading-relaxed whitespace-pre-line text-zinc-800">
                  {post.content}
                </div>

                {/* Media */}
                {post.mediaUrl && (
                  <div className="mt-2 mx-4 h-[340px] rounded-[16px] bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center relative overflow-hidden shadow-inner">
                    <span className="text-[72px]">📷</span>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="px-4 py-3 flex items-center justify-between text-[12px] text-zinc-500 border-b border-zinc-100 mt-2">
                  <div className="flex items-center gap-1.5 hover:underline cursor-pointer" onClick={() => handleLike(post.id)}>
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white z-20">
                        <Heart className={`w-2.5 h-2.5 ${post.hasLiked ? 'fill-white' : ''}`} />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white z-10"></div>
                      <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white z-0"></div>
                    </div>
                    <span className="ml-1 font-medium">{post.reactions || 0}</span>
                  </div>
                  <span className="hover:underline cursor-pointer font-medium">
                    {post.comments || 0} comments
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="px-2 py-1 flex justify-between">
                  {[
                    { label: "Like", icon: Heart, active: post.hasLiked, onClick: () => handleLike(post.id) },
                    { label: "Comment", icon: MessageSquare, onClick: () => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id) },
                    { label: "Share", icon: Share2, onClick: () => navigator.share({ text: post.content }).catch(() => alert("Link copied to clipboard!")) },
                    { label: "Send Offer", icon: Send, primary: true, onClick: () => alert("Navigate to marketplace to send offer") }
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={btn.onClick}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-colors ${
                        btn.primary ? "text-white bg-zinc-900 hover:bg-black mx-1 shadow-sm" :
                        btn.active ? "text-blue-600 bg-blue-50" :
                        "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <btn.icon className={`w-4 h-4 ${btn.active ? "fill-blue-600" : ""}`} />
                      <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                  ))}
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-4">
                    {(post.replies || []).map((comment: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 shrink-0 flex items-center justify-center text-white font-bold text-[10px]">
                          {comment.author_name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[13px]">{comment.author_name}</span>
                            <span className="text-[11px] text-zinc-500 font-medium">• {comment.author_role}</span>
                            <span className="text-[10px] text-zinc-400 ml-auto">{formatTime(comment.created_at)}</span>
                          </div>
                          <div className="text-[13px] text-zinc-800 leading-snug">{comment.content}</div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientClass} text-white shrink-0 flex items-center justify-center text-[12px] font-bold shadow-sm`}>
                        {currentUser.substring(0, 2).toUpperCase()}
                      </div>
                      <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex-1 flex gap-2">
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment or advice..."
                          className="flex-1 h-10 rounded-full border border-zinc-200 px-4 text-[13px] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 bg-white shadow-sm"
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="h-10 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-5 h-fit sticky top-[88px]">
          <div className="rounded-[20px] bg-white border border-zinc-200 p-5 shadow-sm">
            <h4 className="font-bold text-[14px] mb-4">People You May Know</h4>
            <div className="space-y-4">
              {[
                { id: "demo-expert-dr-kavita", name: "Dr. Kavita Rao", role: "Agri Expert • Indore", mutual: "12 mutual" },
                { id: "demo-farmer-rajesh", name: "Rajesh Pawar", role: "Gram Cultivator • Sehore", mutual: "8 mutual" },
                { id: "demo-fpo-malwa", name: "Malwa Kisan FPO", role: "248 Farmers • Rau", mutual: "18 mutual" },
                { id: "demo-buyer-bhopal", name: "Vikram Singh", role: "Solvex Buyer • Mandideep", mutual: "5 mutual" }
              ].map((person, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Link
                    href={`/profile/${person.id}`}
                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 text-[12px] shrink-0 hover:bg-zinc-200 transition-colors"
                  >
                    {person.name.substring(0, 2).toUpperCase()}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${person.id}`}
                      className="font-semibold text-[13px] leading-tight truncate hover:underline text-zinc-900 block"
                    >
                      {person.name}
                    </Link>
                    <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 truncate">{person.role}</div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-8 px-3 rounded-full text-[12px] font-semibold">
                    <Link href={`/profile/${person.id}`}>
                      View ID
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-zinc-200 p-5 shadow-sm">
            <h4 className="font-bold text-[14px] mb-4">Trending in Agriculture</h4>
            <div className="space-y-3.5 text-[13px]">
              {[
                { tag: "#OrganicFarming", posts: "2.4k posts" },
                { tag: "#MandiBhav", posts: "1.8k posts" },
                { tag: "#DripIrrigation", posts: "1.2k posts" },
                { tag: "#KisanMela2026", posts: "892 posts" }
              ].map(item => (
                <div key={item.tag} className="flex justify-between items-center hover:bg-zinc-50 p-1.5 -mx-1.5 rounded-lg cursor-pointer transition-colors">
                  <span className="font-bold text-blue-700 tracking-tight">{item.tag}</span>
                  <span className="text-[11px] text-zinc-500 font-medium">{item.posts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-[560px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-extrabold text-[18px] tracking-tight">Create a post</h3>
              <button onClick={() => setShowComposer(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[14px] bg-gradient-to-br ${gradientClass}`}>
                  {currentUser.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[15px]">{currentUser}</div>
                  <div className="text-[12px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-semibold mt-1 inline-flex items-center gap-1">
                    🌍 Anyone
                  </div>
                </div>
              </div>

              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full h-36 resize-none outline-none text-[16px] leading-relaxed placeholder:text-zinc-400"
                autoFocus
              ></textarea>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                <div className="flex gap-1.5">
                  <button className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-blue-600">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-green-600">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-amber-600">
                    <BarChart2 className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-red-500">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                <Button
                  onClick={handlePostSubmit}
                  disabled={!postContent.trim()}
                  className={`h-10 px-6 rounded-full font-bold text-[14px] text-white bg-gradient-to-br ${gradientClass} shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100`}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NetworkPage() {
  const { user, loading } = useUser();

  if (loading) return <LoadingSkeleton variant="detail" />;

  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <NetworkContent />
    </Suspense>
  );
}