"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Package, Building2, Truck, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFpoMembers, getFpoSupply, getFpoCollectionCenters } from "@/lib/services/domain";
import type { FpoMember, FpoSupplyLot, FpoCollectionCenter } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function FpoDashboard() {
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["fpo"]);
  const [members, setMembers] = useState<FpoMember[]>([]);
  const [supply, setSupply] = useState<FpoSupplyLot[]>([]);
  const [centers, setCenters] = useState<FpoCollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user || !hasAccess) return;
    try {
      setMembers(getFpoMembers().data);
      setSupply(getFpoSupply().data);
      setCenters(getFpoCollectionCenters().data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, userLoading, hasAccess]);

  if (userLoading || loading || !user || !hasAccess) return <LoadingSkeleton />;

  const totalVolume = supply.reduce((acc, curr) => acc + curr.quantity, 0);
  const activePools = supply.filter(s => s.status === "pooled" || s.status === "partially_allocated");

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto theme-buyer">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">FPO Operations Hub</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage your Farmer Producer Organization, aggregate lots, and oversee logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          { label: "Total Members", value: members.length.toString(), icon: Users, grad: "from-blue-500 to-indigo-600" },
          { label: "Aggregated Volume", value: `${totalVolume} Qtl`, icon: Package, grad: "from-emerald-500 to-teal-500" },
          { label: "Active Pools", value: activePools.length.toString(), icon: TrendingUp, grad: "from-amber-400 to-orange-500" },
          { label: "Collection Centers", value: centers.length.toString(), icon: Building2, grad: "from-violet-500 to-purple-600" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-[20px] border border-zinc-200 p-4 lg:p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.grad} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[22px] font-extrabold mt-1">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4">Pooled Bulk Tenders</h3>
          <div className="space-y-3">
            {supply.map((pool, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900 capitalize">{pool.crop}</div>
                  <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                    {pool.quantity} Qtl • {pool.members} members contributing
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 capitalize">{pool.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] mb-4">Collection Centers</h3>
          <div className="space-y-3">
            {centers.map((center, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-zinc-50/50 border border-zinc-100">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold truncate text-zinc-900">{center.name}</div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    Capacity: {center.currentHoldingsQuintals || center.currentStock}/{center.capacityQuintals} Qtl
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
