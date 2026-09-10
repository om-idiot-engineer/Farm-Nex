"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Phone,
  MapPin,
  FileText,
  Clock,
  Building2,
  Lock
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getAdminUsers, approveAdminUser } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function AdminUsersPage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [users, setUsers] = useState(() => getAdminUsers().data);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleApprove = (userId: string) => {
    approveAdminUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true, status: "active" as const } : u));
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase()) ||
      (u.documentId || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "pending" && !u.verified) ||
      (statusFilter === "verified" && u.verified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Operations Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            User KYC & Verification Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit government Aadhaar records, FPO registration certificates, and buyer GSTIN credentials to maintain marketplace trust.
          </p>
        </div>

        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          {users.filter(u => !u.verified).length} Verifications Pending
        </span>
      </div>

      <DemoNotice>
        Approving verification immediately updates the user&apos;s digital badge across produce listings, RFQs, and order escrow contracts.
      </DemoNotice>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, city, or doc ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="fpo">FPOs</option>
            <option value="buyer">Bulk Buyers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified Active</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">User & Organization</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">KYC Document</th>
                <th className="px-5 py-3">Verification Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/20 text-xs">
                  <td className="px-5 py-4">
                    <div className="font-bold text-foreground text-sm">{u.name}</div>
                    <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {u.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-black uppercase text-foreground">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {u.location}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-foreground">{u.documentType}</span>
                    <span className="block font-mono text-[11px] text-muted-foreground">{u.documentId}</span>
                  </td>
                  <td className="px-5 py-4">
                    {u.verified ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Verified Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {u.verified ? (
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <Link href={`/profile/${u.id}`}>View Record</Link>
                      </Button>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleApprove(u.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          Approve KYC
                        </Button>
                        <Button variant="outline" size="sm" asChild className="text-xs">
                          <Link href={`/profile/${u.id}`}>Audit</Link>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
