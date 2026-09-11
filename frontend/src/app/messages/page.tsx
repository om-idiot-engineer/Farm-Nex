"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Phone, MoreVertical, Paperclip, Send, CheckCircle2, MessageSquare, Plus, UsersRound } from "lucide-react";
import { useUser } from "@/lib/auth/UserContext";
import { getMessages, getConversation, sendMessage, createConversation, type Conversation, type ConversationMessage } from "@/lib/services/domain";
import AccountDirectoryModal from "@/components/AccountDirectoryModal";
import type { TestUserAccount } from "@/lib/data/userDirectory";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";

function MessagesContent() {
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const recipientIdParam = searchParams.get("recipientId");
  const isFarmer = user?.role === "farmer";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accountDirectoryOpen, setAccountDirectoryOpen] = useState(false);

  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";
  const gradientClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";
  const accentColor = isFarmer ? "bg-emerald-600" : "bg-blue-600";
  const accentLight = isFarmer ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";

  const loadConversations = async () => {
    try {
      const res = await getMessages();
      let convList = res.data || [];

      // If user came via /messages?recipientId=...
      if (recipientIdParam) {
        const existing = convList.find(c => c.participantId === recipientIdParam);
        if (existing) {
          setActiveChat(existing.id);
        } else {
          try {
            const newChatRes = await createConversation(recipientIdParam);
            if (newChatRes.data) {
              convList = [newChatRes.data, ...convList];
              setActiveChat(newChatRes.data.id);
            }
          } catch (err) {
            console.error("Failed to auto-create chat with recipient:", err);
          }
        }
      } else if (convList.length > 0 && !activeChat) {
        setActiveChat(convList[0].id);
      }

      setConversations(convList);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || userLoading) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading, recipientIdParam]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat || !user || sending) return;

    const currentMessageText = messageText;
    setMessageText("");
    setSending(true);

    try {
      await sendMessage(activeChat, user.id, currentMessageText, "text");
      setConversations(conversations.map(c =>
        c.id === activeChat
          ? { ...c, lastMessage: currentMessageText, updatedAt: new Date().toISOString(), unread: 0, messages: [...c.messages, { id: `msg-${Date.now()}`, senderId: user.id, body: currentMessageText, createdAt: new Date().toISOString(), kind: "text" }] }
          : c
      ));
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSelectAccountForChat = async (account: TestUserAccount) => {
    if (!user) return;
    try {
      const existing = conversations.find(c => c.participantId === account.id);
      if (existing) {
        setActiveChat(existing.id);
        return;
      }
      const res = await createConversation(account.id);
      if (res.data) {
        setConversations([res.data, ...conversations]);
        setActiveChat(res.data.id);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const handleNewChat = () => {
    setAccountDirectoryOpen(true);
  };

  const activeConversation = conversations.find(c => c.id === activeChat);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-IN", { weekday: "short" });
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (userLoading || loading) return <LoadingSkeleton variant="detail" />;

  return (
    <div className={`p-4 lg:p-6 max-w-[1440px] mx-auto h-[calc(100vh-64px)] ${themeClass}`}>
      <div className="bg-white rounded-[24px] border border-zinc-200 shadow-sm overflow-hidden flex h-[calc(100vh-120px)] min-h-[600px]">

        {/* Left Sidebar (Chats List) */}
        <div className="w-full md:w-[320px] border-r border-zinc-200 flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between">
            <h2 className="font-bold text-[16px]">Messages • Negotiation Hub</h2>
            <Button onClick={handleNewChat} size="sm" className="h-8 rounded-full font-bold" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>

          <div className="p-3 border-b border-zinc-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                placeholder="Search chats, products..."
                className="w-full h-9 pl-9 pr-3 rounded-full bg-zinc-100 text-[13px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start negotiating with buyers or farmers</p>
              </div>
            ) : (
              conversations.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full p-4 flex gap-3 text-left hover:bg-white transition-colors border-b border-black/[0.03] ${activeChat === chat.id ? "bg-white shadow-sm border-l-4 border-l-zinc-900" : ""}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] text-white ${chat.participantVerified ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                      {chat.participantName?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    {chat.context && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Active negotiation" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[13px] truncate">{chat.participantName}</span>
                      <span className="text-[11px] text-zinc-500 shrink-0">{formatTime(chat.updatedAt)}</span>
                    </div>
                    <div className="text-[12px] text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
                      {chat.context && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${accentLight}`}>
                          {chat.context.crop} • {chat.context.quantity}Q
                        </span>
                      )}
                      <span className="truncate">{chat.lastMessage || "Start a conversation"}</span>
                    </div>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Area (Chat View) */}
        {activeChat ? (
          <div className="hidden md:flex flex-1 flex-col bg-white">
            {/* Chat Header */}
            <div className="h-[64px] border-b border-zinc-200 px-5 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[12px]">
                  {activeConversation?.participantName?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div>
                  <div className="font-bold text-[14px] flex items-center gap-2">
                    {activeConversation?.participantName}
                    {activeConversation?.participantVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                  <Phone className="w-4 h-4 text-zinc-600" />
                </button>
                <button className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                  <MoreVertical className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            </div>

            {/* Context Strip */}
            {activeConversation?.context && (
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl shadow-sm">
                  🌾
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[13px] text-amber-900">
                    {activeConversation.context.crop} • {activeConversation.context.quantity}Q
                  </div>
                  <div className="text-[11px] text-amber-700/80 mt-0.5">
                    ₹{activeConversation.context.offer?.toLocaleString("en-IN") || "—"}/Q • {activeConversation.context.location} • {activeConversation.context.payment}
                  </div>
                </div>
                <button className="h-8 px-4 rounded-full bg-zinc-900 text-white text-[11px] font-bold shadow-sm">
                  View Deal
                </button>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FCFCF9]">
              {activeConversation?.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                  <MessageSquare className="w-12 h-12 mb-3 text-zinc-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the negotiation by sending a message below</p>
                </div>
              ) : (
                <>
                  {activeConversation?.messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    const showDate = idx === 0 || formatDate(msg.createdAt) !== formatDate(activeConversation.messages[idx - 1].createdAt);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <span className="text-[11px] bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 font-medium border border-zinc-200">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMe ? 'bg-zinc-900 text-white rounded-2xl rounded-br-sm' : 'bg-white border border-zinc-200 shadow-sm rounded-2xl rounded-bl-sm'} px-4 py-3`}>
                            {msg.kind === "offer" && msg.offerData ? (
                              <div className="bg-white rounded-xl p-3 text-zinc-900 border border-zinc-200">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Make Offer</div>
                                <div className="font-extrabold text-[16px] leading-tight">
                                  ₹{msg.offerData.rate}/Q • {msg.offerData.quantity}Q
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-1">
                                  Pickup: {msg.offerData.pickup} • Payment: {msg.offerData.payment}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button className={`flex-1 h-8 rounded-full ${accentColor} text-white text-[12px] font-bold`}>Accept</button>
                                  <button className="flex-1 h-8 rounded-full bg-zinc-100 text-zinc-700 text-[12px] font-bold hover:bg-zinc-200">Counter</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-[13px] leading-relaxed">{msg.body}</div>
                                <div className={`text-[10px] mt-1.5 font-medium ${isMe ? 'text-white/50' : 'text-zinc-400'}`}>
                                  {formatTime(msg.createdAt)} {isMe && '✓✓'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-zinc-200 bg-white shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button type="button" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                  <Paperclip className="w-4 h-4 text-zinc-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type message, offer price..."
                    className="w-full h-11 pl-4 pr-12 rounded-full bg-zinc-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 text-[14px] transition-colors border border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="absolute right-1.5 top-1.5 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['₹42/kg?', 'Sample please', 'Delivery tomorrow?', 'Regular supply?'].map(chip => (
                  <button key={chip} type="button" onClick={() => setMessageText(chip)} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-medium whitespace-nowrap hover:bg-zinc-900 hover:text-white transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="font-bold text-[15px]">Your Messages</h3>
              <p className="text-[13px] text-zinc-500 mt-1">Select a chat to view negotiation history</p>
            </div>
          </div>
        )}

      </div>

      {/* Select User to Start New Negotiation / Chat */}
      <AccountDirectoryModal
        isOpen={accountDirectoryOpen}
        onClose={() => setAccountDirectoryOpen(false)}
        mode="select"
        onSelectAccount={handleSelectAccountForChat}
        title="Start Chat with Any Ecosystem Account (22 Profiles)"
        subtitle="Select a farmer, collective FPO, food processor, or trade expert to initiate a direct negotiation channel."
      />
    </div>
  );
}

export default function MessagesPage() {
  const { user, loading } = useUser();

  if (loading) return <LoadingSkeleton variant="detail" />;

  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <MessagesContent />
    </Suspense>
  );
}