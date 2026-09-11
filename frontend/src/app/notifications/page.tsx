"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  TrendingUp,
  Truck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getNotifications, markNotificationsRead, markNotificationAsRead } from "@/lib/services/domain";
import type { AppNotification } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

type NotifCategory = "all" | "deals" | "market" | "network";

export default function NotificationCenterPage() {
  const { user, loading: userLoading, hasAccess } = useRequiredUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<NotifCategory>("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadNotifications();
  }, [hasAccess, user]);

  const handleMarkAllRead = async () => {
    await markNotificationsRead();
    setNotifications((curr) => curr.map((n) => ({ ...n, unread: false })));
  };

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const filtered = notifications.filter((n) => {
    if (filter === "deals") return n.type === "interest" || n.type === "logistics" || n.type === "payment";
    if (filter === "market") return n.type === "market";
    if (filter === "network") return n.type === "network" || n.type === "response";
    return true;
  });

  const getIcon = (type: AppNotification["type"]) => {
    if (type === "interest" || type === "response") return MessageSquare;
    if (type === "logistics") return Truck;
    if (type === "payment") return CheckCircle2;
    if (type === "market") return TrendingUp;
    return Sparkles;
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Bell className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Updates & Alerts
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground">Notification Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational alerts for matching buyer bids, scheduled dispatches, and market thresholds.
          </p>
        </div>

        {notifications.some((n) => n.unread) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold shrink-0"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-3 text-xs">
        {[
          { id: "all", label: "All Alerts" },
          { id: "deals", label: "Deals & Logistics" },
          { id: "market", label: "Market Alerts" },
          { id: "network", label: "Network & Discussions" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as NotifCategory)}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${
              filter === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <LoadingSkeleton variant="card" rows={4} />
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => {
                  if (n.unread) {
                    markNotificationAsRead(n.id);
                    setNotifications((curr) =>
                      curr.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                    );
                  }
                }}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  n.unread
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-card border-border hover:bg-muted/20"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 mt-0.5 ${
                    n.type === "payment"
                      ? "bg-emerald-100 text-emerald-800"
                      : n.type === "logistics"
                      ? "bg-amber-100 text-amber-900"
                      : n.type === "market"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${n.unread ? "font-black text-foreground" : "font-bold text-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {n.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-2">
                    View update <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No alerts in this category"
          description="We will notify you when buyers make offers on your lots or consignments reach milestone checkpoints."
          action="Back to marketplace"
          href="/marketplace"
          icon={Bell}
        />
      )}
    </div>
  );
}
