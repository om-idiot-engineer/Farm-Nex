"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Package, ArrowRight, Truck, CheckCircle2, MessageCircle } from "lucide-react";
import { useUser } from "@/lib/auth/UserContext";
import { getAgreements } from "@/lib/services/domain";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type TradeStatus = ExtendedTradeAgreement["status"];

const statusLabels: Record<TradeStatus, string> = {
  matched: "Matched",
  trade_confirmed: "Confirmed",
  pickup_scheduled: "Pickup Scheduled",
  pickup_completed: "Pickup Completed",
  in_transit: "In Transit",
  delivered: "Delivered",
  payment_confirmed: "Payment Confirmed",
  completed: "Completed",
};

const statusClasses: Record<TradeStatus, string> = {
  matched: "from-amber-400 to-orange-500",
  trade_confirmed: "from-emerald-500 to-green-600",
  pickup_scheduled: "from-emerald-500 to-green-600",
  pickup_completed: "from-emerald-500 to-green-600",
  in_transit: "from-blue-500 to-indigo-600",
  delivered: "from-blue-500 to-indigo-600",
  payment_confirmed: "from-emerald-500 to-green-600",
  completed: "from-emerald-500 to-green-600",
};

const statusIcons: Record<string, React.ReactNode> = {
  negotiation: <Package className="w-6 h-6" />,
  accepted: <CheckCircle2 className="w-6 h-6" />,
  in_transit: <Truck className="w-6 h-6" />,
  delivered: <CheckCircle2 className="w-6 h-6" />,
};

function DealsPage() {
  const { user, loading: userLoading } = useUser();
  const isFarmer = user?.role === "farmer";
  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";
  const gradientClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";

  const [activeFilter, setActiveFilter] = useState("all");
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [agreements, setAgreements] = useState<ExtendedTradeAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading) return;
    async function loadAgreements() {
      try {
        const res = await getAgreements();
        setAgreements(res.data);
      } catch (err) {
        console.error("Failed to load agreements:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAgreements();
  }, [user, userLoading]);

  if (userLoading || loading) return <LoadingSkeleton variant="detail" />;

  const filteredAgreements = agreements.filter(a => {
    if (activeFilter === "all") return true;
    if (activeFilter === "negotiation") return a.status === "matched";
    if (activeFilter === "accepted") return a.status === "trade_confirmed" || a.status === "pickup_scheduled" || a.status === "pickup_completed";
    if (activeFilter === "transit") return a.status === "in_transit";
    if (activeFilter === "delivered") return a.status === "delivered" || a.status === "payment_confirmed" || a.status === "completed";
    return true;
  });

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto ${themeClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">Orders & Negotiations</h1>
        <div className="flex gap-1.5 p-1.5 rounded-full bg-zinc-100 overflow-x-auto no-scrollbar border border-zinc-200">
          {[
            { id: "all", label: "All" },
            { id: "negotiation", label: "Pending" },
            { id: "accepted", label: "Accepted" },
            { id: "transit", label: "In Transit" },
            { id: "delivered", label: "Delivered" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAgreements.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-white rounded-[24px] border border-zinc-200">
            <div className="w-16 h-16 rounded-full bg-zinc-100 mx-auto mb-3">
              {isFarmer ? <Package className="w-8 h-8 text-zinc-400" /> : <Truck className="w-8 h-8 text-zinc-400" />}
            </div>
            <h3 className="font-bold text-[15px] mb-2">
              {isFarmer ? "No active orders" : "No procurement agreements"}
            </h3>
            <p className="text-sm">
              {isFarmer
              ? "Your listings haven't matched with buyers yet. List your produce to start receiving offers."
              : "You haven't posted any procurement requirements yet."}
            </p>
          </div>
        ) : (
          filteredAgreements.map((order) => {
            const statusKey = order.status as TradeStatus;
            const isActive = activeOrder === order.id;
            const statusLabel = statusLabels[statusKey];
            const statusGradient = statusClasses[statusKey];

            return (
              <div key={order.id} className={`bg-white rounded-[24px] overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 ${isActive ? 'ring-2 ring-zinc-900/10' : ''}`}>
                <button
                  onClick={() => setActiveOrder(isActive ? null : order.id)}
                  className="w-full p-4 lg:p-6 flex items-center gap-4 text-left bg-white"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${statusGradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {statusIcons[statusKey] || <Package className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[15px]">{order.orderNumber || order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        statusKey === 'matched' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        statusKey === 'trade_confirmed' || statusKey === 'pickup_scheduled' || statusKey === 'pickup_completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-[13px] text-zinc-600 mt-1 font-medium">
                      {order.farmer_name} ↔ {order.buyer_name} • ₹{order.price_per_quintal.toLocaleString("en-IN")}/Q
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[12px] text-zinc-500 font-medium">{isActive ? 'Hide timeline' : 'View timeline'}</span>
                    <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                      <ArrowRight className="w-4 h-4 text-zinc-600 rotate-90" />
                    </div>
                  </div>
                </button>

                {isActive && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6 lg:gap-8">
                    {/* Timeline */}
                    <div>
                      <h4 className="font-bold text-[12px] uppercase tracking-wider text-zinc-500 mb-5">Order Journey</h4>
                      <div className="relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-zinc-200"></div>
                        {(order as any).timeline ? (order as any).timeline.map((stage: any, idx: number) => (
                          <div key={idx} className="relative flex gap-3.5 pb-6 last:pb-0">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${
                              stage.done ? 'border-emerald-500 bg-emerald-500' :
                              stage.current ? 'border-amber-500 bg-amber-500 shadow-sm' :
                              'border-zinc-300'
                            }`}>
                              {stage.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                              {stage.current && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                            </div>
                            <div className="flex-1 min-w-0 -mt-0.5">
                              <div className={`text-[13px] font-bold leading-tight ${
                                stage.current ? 'text-amber-700' :
                                stage.done ? 'text-zinc-900' : 'text-zinc-400'
                              }`}>
                                {stage.stage} {stage.actor && <span className="text-[11px] font-medium opacity-80"> • {stage.actor}</span>}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-1 font-medium">{stage.time}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="space-y-3">
                            {(["matched", "trade_confirmed", "pickup_scheduled", "pickup_completed", "in_transit", "delivered", "payment_confirmed", "completed"] as TradeStatus[]).map((stage, idx) => {
                              const stageOrder = ["matched", "trade_confirmed", "pickup_scheduled", "pickup_completed", "in_transit", "delivered", "payment_confirmed", "completed"];
                              const currentIdx = stageOrder.indexOf(statusKey);
                              const isDone = idx < currentIdx;
                              const isCurrent = idx === currentIdx;
                              const stageLabels: Record<string, string> = {
                                matched: "Matched",
                                trade_confirmed: "Trade Confirmed",
                                pickup_scheduled: "Pickup Scheduled",
                                pickup_completed: "Pickup Completed",
                                in_transit: "In Transit",
                                delivered: "Delivered",
                                payment_confirmed: "Payment Confirmed",
                                completed: "Completed",
                              };
                              return (
                                <div key={stage} className="relative flex gap-3.5 pb-6 last:pb-0">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${
                                    isDone ? 'border-emerald-500 bg-emerald-500' :
                                    isCurrent ? 'border-amber-500 bg-amber-500 shadow-sm' :
                                    'border-zinc-300'
                                  }`}>
                                    {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    {isCurrent && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                                  </div>
                                  <div className="flex-1 min-w-0 -mt-0.5">
                                    <div className={`text-[13px] font-bold leading-tight ${
                                      isCurrent ? 'text-amber-700' : isDone ? 'text-zinc-900' : 'text-zinc-400'
                                    }`}>
                                      {stageLabels[stage]}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Negotiation Center */}
                    <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm flex flex-col">
                      <h4 className="font-bold text-[12px] uppercase tracking-wider text-zinc-500 mb-4">Live Negotiation</h4>

                      <div className="flex-1 space-y-4 max-h-[280px] overflow-y-auto no-scrollbar">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-zinc-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] leading-relaxed shadow-sm">
                            <div className="font-bold text-[11px] mb-1 opacity-70">You</div>
                            {statusKey === 'matched'
                              ? "We can do ₹42/kg. Quality is good, but transport cost is high."
                              : statusKey === 'trade_confirmed'
                                ? `Deal accepted: ₹${order.price_per_quintal}/Q with ${order.quantity}Q delivery scheduled`
                                : "Deal status updates will appear here"}
                            <div className="text-[10px] mt-1.5 opacity-50 font-medium">10:42 AM</div>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <div className="max-w-[85%] bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed shadow-sm">
                            <div className="font-bold text-[11px] mb-1 text-zinc-500">Counterparty</div>
                            {statusKey === 'matched'
                              ? "₹45 final kar dete hain, transport included. Kal subah harvest hago."
                              : "Negotiation completed - deal finalized"}
                            <div className="text-[10px] mt-1.5 text-zinc-400 font-medium">11:15 AM</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
                        <h4 className="font-bold text-[12px] uppercase tracking-wider text-zinc-500 mb-4">Parties</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                              {order.farmer_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[13px] text-zinc-900">{order.farmer_name}</div>
                              <div className="text-[11px] text-zinc-500 font-medium">Farmer • Sehore • ⭐4.8</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                              {order.buyer_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[13px] text-zinc-900">{order.buyer_name}</div>
                              <div className="text-[11px] text-zinc-500 font-medium">Buyer • Bhopal</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button className="h-10 rounded-full bg-white border border-zinc-200 font-bold text-[12px] text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                          <MessageCircle className="w-4 h-4" /> Chat
                        </button>
                        <button className="h-10 rounded-full bg-white border border-zinc-200 font-bold text-[12px] text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
                          Counter ₹
                        </button>
                        <button className={`col-span-2 h-11 rounded-full font-bold text-[13px] text-white bg-gradient-to-br ${gradientClass} shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-transform`}>
                          Accept Offer • ₹{(order.price_per_quintal * order.quantity).toLocaleString("en-IN")}
                        </button>

                        {!isFarmer && statusKey === 'in_transit' && (
                          <div className="col-span-2 mt-2 rounded-xl bg-blue-50 border border-blue-100 p-3 text-[11px] text-blue-700 font-medium flex items-start gap-2">
                            <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">Live tracking: Truck is 12km away. Estimated arrival in 40 mins. View Map.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DealsContainer() {
  const { user, loading } = useUser();

  if (loading) return <LoadingSkeleton variant="detail" />;

  return (
    <Suspense fallback={<LoadingSkeleton variant="detail" />}>
      <DealsPage />
    </Suspense>
  );
}
