"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Send,
  Building2,
  FileCheck2,
  Scale,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Truck,
  Calendar,
  X,
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getMessages, sendMessage, acceptBuyerMatch, type DataSource } from "@/lib/services/domain";
import type { Conversation, ConversationMessage } from "@/lib/data/demo";
import TrustBadge from "@/components/TrustBadge";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedConversation = searchParams.get("conversation");
  const { user, loading: userLoading, hasAccess } = useRequiredUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterRate, setCounterRate] = useState<number>(5380);
  const [acceptingDeal, setAcceptingDeal] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getMessages();
      setConversations(result.data);
      const availableIds = result.data.map((c) => c.id);
      if (requestedConversation && availableIds.includes(requestedConversation)) {
        setSelectedId(requestedConversation);
        setMobileShowChat(true);
      } else if (availableIds.length > 0 && !selectedId) {
        setSelectedId(availableIds[0]);
      }
    } catch (err: any) {
      setError(err.message || "We could not load your messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadMessages();
  }, [hasAccess, requestedConversation, user]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !body.trim()) return;
    const text = body.trim();
    setBody("");
    try {
      const result = await sendMessage(selectedConversation.id, user.id, text, "text");
      setConversations((current) =>
        current.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: text,
                updatedAt: result.data.createdAt,
                messages: [...c.messages, result.data],
              }
            : c
        )
      );
    } catch (err: any) {
      setError(err.message || "We could not send that message.");
      setBody(text);
    }
  };

  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !counterRate) return;
    const counterMsg = `Formal Counter Offer: ₹${counterRate.toLocaleString("en-IN")}/quintal for ${selectedConversation.context?.quantity || 250}Q ${selectedConversation.context?.crop || "produce"}.`;
    try {
      const result = await sendMessage(
        selectedConversation.id,
        user.id,
        counterMsg,
        "counter_offer",
        {
          rate: counterRate,
          quantity: selectedConversation.context?.quantity || 250,
          pickup: "Farm-gate pickup",
          payment: "Within 24h",
        }
      );
      setConversations((current) =>
        current.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: counterMsg,
                updatedAt: result.data.createdAt,
                messages: [...c.messages, result.data],
              }
            : c
        )
      );
      setCounterModalOpen(false);
    } catch (err: any) {
      alert("Failed to submit counter offer.");
    }
  };

  const handleAcceptDealInChat = async () => {
    if (!user || !selectedConversation) return;
    setAcceptingDeal(true);
    try {
      const listingId = selectedConversation.context?.listingId || "demo-lot-fn-28492";
      const demandId = selectedConversation.context?.demandId || "demo-demand-agrocorp-500";
      const res = await acceptBuyerMatch(listingId, demandId, user);
      await sendMessage(
        selectedConversation.id,
        user.id,
        `Deal accepted! Order #${res.data.orderNumber} created. Pickup scheduled for 8 September.`,
        "acceptance"
      );
      router.push(`/orders/${res.data.id}`);
    } catch (err: any) {
      alert("Could not process deal acceptance.");
    } finally {
      setAcceptingDeal(false);
    }
  };

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;
  if (loading) return <LoadingSkeleton variant="detail" />;
  if (error) return <div className="mx-auto max-w-5xl py-8"><ErrorState message={error} onRetry={loadMessages} /></div>;
  if (!conversations.length) {
    return (
      <div className="mx-auto max-w-5xl py-8">
        <EmptyState
          title="No conversations yet"
          description="Messages start automatically when a buyer or farmer initiates contact around a listed lot or buyer RFQ."
          action="Browse marketplace"
          href="/marketplace"
          icon={MessageSquare}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 py-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-primary">
            Trade & Contract Inquiries
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Deal Messages</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Marketplace
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Deal conversations are stored in your local browser state until the messaging service is connected.
      </DemoNotice>

      {/* Split Workspace */}
      <div className="grid border border-border bg-card rounded-lg shadow-sm min-h-[36rem] md:grid-cols-[19rem_1fr] overflow-hidden">
        {/* LEFT COLUMN: Conversation List */}
        <aside
          className={`border-b md:border-b-0 md:border-r border-border ${
            mobileShowChat ? "hidden md:block" : "block"
          }`}
        >
          <div className="border-b border-border px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground bg-muted/20">
            Active Deals & Inquiries
          </div>

          <div className="divide-y divide-border">
            {conversations.map((c) => {
              const isSelected = selectedId === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full text-left p-4 transition-colors block ${
                    isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {c.participantName}
                        </span>
                        {c.participantVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-primary font-semibold mt-0.5 truncate">
                        {c.context?.crop} · {c.context?.quantity}Q
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{c.lastMessage}</p>
                    </div>

                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Chat & Deal Context Panel */}
        {selectedConversation ? (
          <section
            className={`flex flex-col min-h-[36rem] bg-card ${
              !mobileShowChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header with back button for mobile */}
            <div className="border-b border-border px-5 py-3.5 flex items-center justify-between gap-3 bg-muted/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">
                      {selectedConversation.participantName}
                    </span>
                    <TrustBadge
                      type={selectedConversation.participantRole.toLowerCase().includes("buyer") ? "buyer" : "producer"}
                      size="sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedConversation.participantRole}
                  </p>
                </div>
              </div>

              <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                <Link href={`/profile/${selectedConversation.participantId}`}>View Profile</Link>
              </Button>
            </div>

            {/* STICKY TRANSACTION CONTEXT PANEL */}
            {selectedConversation.context && (
              <div className="border-b border-primary/20 bg-primary/5 p-4 text-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary text-xs uppercase tracking-wider">
                      {selectedConversation.context.label}
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                      {selectedConversation.context.quantity}Q {selectedConversation.context.crop}
                    </span>
                  </div>

                  {/* Actions in Context Header */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCounterModalOpen(true)}
                      className="h-7 text-xs font-bold"
                    >
                      Counter Offer
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptDealInChat}
                      disabled={acceptingDeal}
                      className="h-7 text-xs font-bold bg-primary"
                    >
                      {acceptingDeal ? "Accepting..." : "Accept Deal"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground border-t border-primary/10 pt-2">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Quality Assay</span>
                    <span className="font-bold text-foreground">{selectedConversation.context.quality}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Active Offer</span>
                    <span className="font-bold text-emerald-800">
                      ₹{selectedConversation.context.offer.toLocaleString("en-IN")}/q
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Transport</span>
                    <span className="font-bold text-foreground">{selectedConversation.context.location}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Settlement</span>
                    <span className="font-bold text-foreground">{selectedConversation.context.payment}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {selectedConversation.messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {msg.kind === "offer" || msg.kind === "counter_offer" ? (
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-lg border text-xs space-y-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-foreground border-border"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                          <DollarSign className="h-3.5 w-3.5" />
                          {msg.kind === "offer" ? "Formal Buyer Offer" : "Farmer Counter Offer"}
                        </div>
                        <p className="text-sm font-semibold">{msg.body}</p>
                        {msg.offerData && (
                          <div className="bg-black/10 p-2 rounded text-[11px] space-y-0.5">
                            <p>Rate: ₹{msg.offerData.rate.toLocaleString("en-IN")}/quintal</p>
                            <p>Pickup: {msg.offerData.pickup}</p>
                            <p>Terms: {msg.offerData.payment}</p>
                          </div>
                        )}
                        <span className="text-[10px] opacity-70 block text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ) : msg.kind === "acceptance" ? (
                      <div className="max-w-[85%] p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span>{msg.body}</span>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted/40 text-foreground border border-border rounded-bl-none"
                        }`}
                      >
                        <p>{msg.body}</p>
                        <span
                          className={`text-[10px] block text-right mt-1 ${
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="border-t border-border p-3 sm:p-4 flex gap-2 bg-card">
              <input
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message, query, or terms..."
                className="min-w-0 flex-1 border border-input rounded-md bg-background px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" disabled={!body.trim()} className="font-bold shrink-0">
                <Send className="h-4 w-4 mr-1.5" />
                Send
              </Button>
            </form>
          </section>
        ) : (
          <div className="hidden md:flex items-center justify-center p-10 text-xs text-muted-foreground">
            Select a conversation to inspect trade context and message.
          </div>
        )}
      </div>

      {/* COUNTER OFFER MODAL */}
      {counterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setCounterModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-black text-foreground">Propose Counter Offer</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Suggest an updated rate for {selectedConversation?.context?.quantity || 250}Q {selectedConversation?.context?.crop || "produce"}.
              </p>
            </div>

            <form onSubmit={handleSendCounterOffer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Your Counter Price (₹/quintal)</label>
                <input
                  type="number"
                  value={counterRate}
                  onChange={(e) => setCounterRate(Number(e.target.value))}
                  className="w-full p-2.5 border border-input rounded font-bold text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="bg-muted/20 p-2.5 rounded text-[11px] text-muted-foreground space-y-1">
                <p>Original Offer: ₹{selectedConversation?.context?.offer.toLocaleString("en-IN")}/q</p>
                <p>Logistics: Farm-gate pickup by buyer</p>
              </div>

              <Button type="submit" className="w-full font-bold">
                Submit Counter Offer
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <MessagesContent />
    </Suspense>
  );
}
