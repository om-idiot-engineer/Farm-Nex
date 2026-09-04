"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Filter,
  ArrowLeft,
  X
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFpoMembers, addFpoMember } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function FpoMembersPage() {
  const { user, loading, hasAccess } = useRequiredUser(["fpo", "admin"]);
  const [members, setMembers] = useState(() => getFpoMembers().data);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New member form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newVillage, setNewVillage] = useState("");
  const [newCrops, setNewCrops] = useState("Soybean, Wheat");
  const [newLandArea, setNewLandArea] = useState("4.5");
  const [newAvailable, setNewAvailable] = useState("100");

  if (loading || !user || !hasAccess) {
    return <LoadingSkeleton variant="card" />;
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = addFpoMember({
      name: newName.trim(),
      phone: newPhone.trim() || "+91 98260 00000",
      village: newVillage.trim() || "Kshipra Village",
      crops: newCrops.split(",").map(c => c.trim()),
      landAreaAcres: parseFloat(newLandArea) || 3,
      availableQuantity: parseFloat(newAvailable) || 50,
      deliveredQuantity: 0,
      pendingQuantity: 0,
      verified: true,
    });

    setMembers([res.data, ...members]);
    setIsAddOpen(false);
    setNewName("");
    setNewPhone("");
    setNewVillage("");
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.village.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = cropFilter === "all" || m.crops.some(c => c.toLowerCase().includes(cropFilter.toLowerCase()));
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/fpo" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to FPO Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Smallholder Member Ledger
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage registered farmers, verified land records, and individual crop yields available for collective pooling.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="bg-primary text-primary-foreground">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Enroll New Farmer
        </Button>
      </div>

      <DemoNotice>
        Changes made to the member ledger persist in your browser session and immediately update available pooling volume.
      </DemoNotice>

      {/* Filters and search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by farmer name or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Crop:</span>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Commodities</option>
            <option value="Soybean">Soybean</option>
            <option value="Wheat">Wheat</option>
            <option value="Chana">Chana</option>
            <option value="Maize">Maize</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Farmer & Status</th>
                <th className="px-5 py-3">Village</th>
                <th className="px-5 py-3">Land Holding</th>
                <th className="px-5 py-3">Key Crops</th>
                <th className="px-5 py-3 text-right">Available Yield</th>
                <th className="px-5 py-3 text-right">Delivered</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{member.name}</span>
                      {member.verified && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {member.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {member.village}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-foreground">
                    {member.landAreaAcres} Acres
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.crops.map((c) => (
                        <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-black text-foreground">
                    {member.availableQuantity} Q
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground">
                    {member.deliveredQuantity} Q
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href={`/profile/${member.id}`}>View Record</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Enroll Smallholder Farmer</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98260 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Village</label>
                  <input
                    type="text"
                    placeholder="e.g. Sanwer"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Land Holding (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLandArea}
                    onChange={(e) => setNewLandArea(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Available Yield (Q)</label>
                  <input
                    type="number"
                    value={newAvailable}
                    onChange={(e) => setNewAvailable(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Crops Cultivated</label>
                <input
                  type="text"
                  placeholder="Soybean, Wheat, Chana"
                  value={newCrops}
                  onChange={(e) => setNewCrops(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Enroll Farmer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
