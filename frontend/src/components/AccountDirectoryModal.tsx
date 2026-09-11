"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UsersRound,
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  X,
  Filter,
  MessageSquare,
  Building2,
  Sprout,
  Store,
  GraduationCap,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { REAL_ACCOUNTS_20, type TestUserAccount } from "@/lib/data/userDirectory";
import { Button } from "@/components/ui/button";

interface AccountDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "select" | "message";
  onSelectAccount?: (account: TestUserAccount) => void;
  title?: string;
  subtitle?: string;
}

export default function AccountDirectoryModal({
  isOpen,
  onClose,
  mode = "message",
  onSelectAccount,
  title,
  subtitle,
}: AccountDirectoryModalProps) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    return REAL_ACCOUNTS_20.filter((acc) => {
      const matchesRole = roleFilter === "all" || acc.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        acc.name.toLowerCase().includes(q) ||
        acc.location.toLowerCase().includes(q) ||
        acc.headline.toLowerCase().includes(q) ||
        acc.crops.some((c) => c.toLowerCase().includes(q)) ||
        (acc.businessName && acc.businessName.toLowerCase().includes(q)) ||
        (acc.fpoName && acc.fpoName.toLowerCase().includes(q));

      return matchesRole && matchesQuery;
    });
  }, [roleFilter, searchQuery]);

  if (!isOpen) return null;

  const handleAccountAction = (acc: TestUserAccount) => {
    if (onSelectAccount) {
      onSelectAccount(acc);
      onClose();
      return;
    }

    router.push(`/messages?recipientId=${acc.id}`);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "farmer":
        return { label: "Farmer", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Sprout };
      case "fpo":
        return { label: "FPO Collective", bg: "bg-teal-100 text-teal-800 border-teal-200", icon: UsersRound };
      case "buyer":
        return { label: "Processor / Buyer", bg: "bg-blue-100 text-blue-800 border-blue-200", icon: Building2 };
      case "consumer":
        return { label: "Consumer / Bulk", bg: "bg-purple-100 text-purple-800 border-purple-200", icon: ShoppingBag };
      case "admin":
        return { label: "System Admin", bg: "bg-amber-100 text-amber-800 border-amber-200", icon: ShieldCheck };
      default:
        return { label: role, bg: "bg-zinc-100 text-zinc-800 border-zinc-200", icon: UsersRound };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                FarmNex Ecosystem Directory
              </span>
            </div>
            <h3 className="text-xl font-black text-zinc-900">
              {title || (mode === "message" ? "Direct Messages & Trade Negotiations" : "Select User for Chat")}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {subtitle || "Connect, collaborate, and trade directly with verified farmers, FPO collectives, and commercial buyers across India."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Role Filters */}
        <div className="p-4 sm:px-6 bg-white border-b border-zinc-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location (Indore, Kota, Dewas...), crop (Soybean, Cotton, Wheat...), or mill..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-zinc-400 font-semibold mr-1 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Role:
            </span>
            {[
              { id: "all", label: "All Users (22)" },
              { id: "farmer", label: "Farmers (8)" },
              { id: "fpo", label: "FPO Collectives (4)" },
              { id: "buyer", label: "Buyers & Mills (5)" },
              { id: "consumer", label: "Consumers (2)" },
              { id: "admin", label: "Experts & Admin (3)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors ${
                  roleFilter === tab.id
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-zinc-100">
          {filteredAccounts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <UsersRound className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
              <p className="font-semibold text-sm">No accounts found matching your query</p>
              <p className="text-xs text-zinc-400 mt-0.5">Try searching for a different crop or district name</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAccounts.map((acc) => {
                const badge = getRoleBadge(acc.role);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs border border-zinc-200">
                            {acc.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={acc.avatarUrl} alt={acc.name} className="h-full w-full object-cover" />
                            ) : (
                              acc.avatar
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-zinc-900 truncate">
                                {acc.name}
                              </span>
                              {acc.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate">
                              <span className="font-semibold text-emerald-600">@{acc.profileId}</span>
                              <span>•</span>
                              <span className="truncate font-medium">{acc.location}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-700 line-clamp-2 mb-2 leading-relaxed">
                        {acc.headline}
                      </p>

                      {/* Crops / tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {acc.crops.slice(0, 3).map((crop) => (
                          <span
                            key={crop}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600"
                          >
                            {crop}
                          </span>
                        ))}
                        {acc.crops.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-zinc-50 text-[10px] text-zinc-400 font-medium">
                            +{acc.crops.length - 3}
                          </span>
                        )}
                        {acc.farmSizeAcres && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                            {acc.farmSizeAcres} Acres
                          </span>
                        )}
                        {acc.procurementCapacity && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-semibold text-blue-700 border border-blue-100">
                            {acc.procurementCapacity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA bar */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 mt-auto">
                      <div className="text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Verified Member</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${acc.id}`}
                          onClick={onClose}
                          className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 px-2.5 py-1 rounded-md hover:bg-zinc-100 transition-colors"
                        >
                          View Profile
                        </Link>

                        <Button
                          size="sm"
                          onClick={() => handleAccountAction(acc)}
                          className="h-7 px-3.5 rounded-lg text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{mode === "select" ? "Select" : "Chat"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong>{filteredAccounts.length}</strong> verified agricultural producers and traders.
          </span>
          <span className="hidden sm:inline text-[11px] text-zinc-400">
            Privacy Protected • No credentials exposed
          </span>
        </div>
      </div>
    </div>
  );
}
