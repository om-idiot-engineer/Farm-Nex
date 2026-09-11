"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UsersRound,
  UserPlus,
  UserCheck,
  Check,
  X,
  Search,
  MapPin,
  Building2,
  Sprout,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Clock,
  Filter,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/UserContext";
import {
  getUserAcceptedConnections,
  getUserPendingRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
  sendConnectionRequest,
  getConnectionStatus,
  getProfile,
  type ConnectionRequest,
  type ConnectionStatus,
} from "@/lib/services/domain";
import { REAL_ACCOUNTS_20, type TestUserAccount } from "@/lib/data/userDirectory";
import type { DemoProfile } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function NetworkConnectionsPage() {
  const { user, loading: userLoading } = useUser();
  const [activeSubTab, setActiveSubTab] = useState<"connections" | "pending" | "discover">("connections");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [connections, setConnections] = useState<DemoProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const reloadData = () => {
    if (!user) return;
    const accepted = getUserAcceptedConnections(user.id);
    setConnections(accepted);

    const { incoming, outgoing } = getUserPendingRequests(user.id);
    setIncomingRequests(incoming);
    setOutgoingRequests(outgoing);
    setLoading(false);
  };

  useEffect(() => {
    if (user && !userLoading) {
      reloadData();
    }
  }, [user, userLoading]);

  const handleAccept = (reqId: string) => {
    setActionInProgress(reqId);
    acceptConnectionRequest(reqId);
    setTimeout(() => {
      reloadData();
      setActionInProgress(null);
    }, 200);
  };

  const handleDecline = (reqId: string) => {
    setActionInProgress(reqId);
    declineConnectionRequest(reqId);
    setTimeout(() => {
      reloadData();
      setActionInProgress(null);
    }, 200);
  };

  const handleConnect = (account: TestUserAccount) => {
    if (!user) return;
    setActionInProgress(account.id);
    try {
      const prof = getProfile(account.id).data;
      sendConnectionRequest(prof, user);
      setTimeout(() => {
        reloadData();
        setActionInProgress(null);
      }, 200);
    } catch (err: any) {
      alert(err.message || "Failed to send connection request");
      setActionInProgress(null);
    }
  };

  if (userLoading || loading) return <LoadingSkeleton variant="detail" />;

  const isFarmer = user?.role === "farmer";
  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";

  // Filter discovery users: exclude current user
  const otherAccounts = REAL_ACCOUNTS_20.filter((a) => a.id.toLowerCase() !== (user?.id || "").toLowerCase());

  const filteredDiscovery = otherAccounts.filter((acc) => {
    const matchesSearch =
      !searchQuery.trim() ||
      acc.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      acc.location.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      acc.headline.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      acc.crops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesLoc =
      locationFilter === "all" ||
      acc.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesRole = roleFilter === "all" || acc.role === roleFilter;

    return matchesSearch && matchesLoc && matchesRole;
  });

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto ${themeClass}`}>
      {/* Header Banner */}
      <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
            <Link href="/network" className="hover:underline flex items-center gap-1">
              ← Kisan Network Feed
            </Link>
            <span>/</span>
            <span>Connections &amp; Requests</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
            <UsersRound className="w-7 h-7 text-emerald-600" />
            Social Networking &amp; Connections
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
            Real bilateral agricultural networking. Connect directly with producers, FPOs, and commercial buyers across Indore, Bhopal, Khandwa, Dewas, and all mandis.
          </p>
        </div>

        {/* User Identity & Stats */}
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-3 rounded-2xl shrink-0">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
            {user?.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span>{user?.name?.slice(0, 2).toUpperCase() || "ME"}</span>
            )}
          </div>
          <div>
            <div className="font-extrabold text-sm text-zinc-900">{user?.name}</div>
            <div className="text-xs text-zinc-500 font-mono">
              ID: <span className="font-bold text-zinc-700">{user?.id?.slice(0, 10)}…</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {connections.length} Connected
              </span>
              {incomingRequests.length > 0 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  {incomingRequests.length} Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab("connections")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === "connections"
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          My Connections ({connections.length})
        </button>

        <button
          onClick={() => setActiveSubTab("pending")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 relative ${
            activeSubTab === "pending"
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          Connection Requests ({incomingRequests.length})
          {incomingRequests.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("discover")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === "discover"
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Find &amp; Connect with Users
        </button>
      </div>

      {/* SUBTAB 1: MY ACCEPTED CONNECTIONS */}
      {activeSubTab === "connections" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200">
            <div className="text-sm font-bold text-zinc-800">
              Your Bilateral Network ({connections.length} accepted)
            </div>
            <p className="text-xs text-zinc-500">
              Both users can view details, chat directly, and exchange commercial quotes.
            </p>
          </div>

          {connections.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-zinc-200 p-12 text-center">
              <UsersRound className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-base text-zinc-800">No connections yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Explore verified farmers, FPOs, and commercial buyers in your mandi district and send a connection request.
              </p>
              <Button
                onClick={() => setActiveSubTab("discover")}
                className="mt-4 rounded-xl font-bold text-xs bg-zinc-900 text-white"
              >
                Discover Users to Connect
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-extrabold text-base shrink-0 border border-zinc-200">
                          {conn.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={conn.avatarUrl} alt={conn.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{conn.avatar || conn.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${conn.id}`}
                            className="font-extrabold text-sm text-zinc-900 hover:underline truncate block"
                          >
                            {conn.name}
                          </Link>
                          <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {conn.location}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {conn.role}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                      {conn.headline}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono bg-zinc-50 p-2 rounded-xl border border-zinc-100 mb-4">
                      <span className="text-zinc-400 font-sans">Unique ID:</span>
                      <span className="font-bold text-zinc-800 truncate">{conn.id}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 h-8 rounded-xl font-bold text-xs border-zinc-300">
                      <Link href={`/profile/${conn.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 h-8 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-black text-white gap-1">
                      <Link href={`/messages?recipientId=${conn.id}`}>
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: PENDING REQUESTS (INCOMING & OUTGOING) */}
      {activeSubTab === "pending" && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Incoming Connection Requests ({incomingRequests.length})
            </h2>

            {incomingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500">
                <p className="font-semibold text-sm">No pending incoming requests</p>
                <p className="text-xs text-zinc-400 mt-1">When other users request to connect with you, they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-extrabold text-base shrink-0 border border-zinc-200">
                          {req.requesterAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={req.requesterAvatarUrl} alt={req.requesterName} className="h-full w-full object-cover" />
                          ) : (
                            <span>{req.requesterAvatar || req.requesterName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/profile/${req.requesterId}`}
                            className="font-extrabold text-sm text-zinc-900 hover:underline"
                          >
                            {req.requesterName}
                          </Link>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {req.requesterLocation}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            {req.requesterRole}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                        Wants to connect
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 font-mono bg-white p-2 rounded-xl border border-zinc-200">
                      User ID: <span className="font-bold text-zinc-800">{req.requesterId}</span>
                    </div>

                    {/* Accept / Decline CTA */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                      <Button
                        size="sm"
                        disabled={actionInProgress === req.id}
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 h-9 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Accept Connection
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionInProgress === req.id}
                        onClick={() => handleDecline(req.id)}
                        className="h-9 px-4 rounded-xl font-bold text-xs text-zinc-600 border-zinc-300 hover:bg-zinc-100"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h2 className="text-sm font-extrabold text-zinc-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Outgoing Requests Sent by You ({outgoingRequests.length})
            </h2>

            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-zinc-500">You have no active pending requests sent to other users.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-900">{req.recipientName}</div>
                      <div className="text-zinc-500 text-[11px]">{req.recipientLocation} · {req.recipientRole}</div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      Request Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: FIND & CONNECT WITH USERS (DISCOVERY) */}
      {activeSubTab === "discover" && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Unique Profile ID, name, city (Indore, Bhopal, Khandwa), crop..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Location filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-zinc-400 font-bold uppercase text-[10px] mr-1">Location:</span>
                {[
                  { id: "all", label: "All Cities" },
                  { id: "indore", label: "Indore" },
                  { id: "bhopal", label: "Bhopal" },
                  { id: "khandwa", label: "Khandwa" },
                  { id: "dewas", label: "Dewas" },
                  { id: "ujjain", label: "Ujjain" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLocationFilter(l.id)}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      locationFilter === l.id
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Role filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-zinc-400 font-bold uppercase text-[10px] mr-1">Role:</span>
                {[
                  { id: "all", label: "All Roles" },
                  { id: "farmer", label: "Farmers" },
                  { id: "fpo", label: "FPOs" },
                  { id: "buyer", label: "Buyers" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoleFilter(r.id)}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      roleFilter === r.id
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiscovery.map((account) => {
              const status = getConnectionStatus(account.id, user?.id);

              return (
                <div
                  key={account.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-extrabold text-base shrink-0 border border-zinc-200">
                          {account.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={account.avatarUrl} alt={account.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{account.avatar}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${account.id}`}
                            className="font-extrabold text-sm text-zinc-900 hover:underline truncate block"
                          >
                            {account.name}
                          </Link>
                          <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {account.location}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 shrink-0">
                        {account.role}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                      {account.headline}
                    </p>

                    {/* Crops */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {account.crops.slice(0, 3).map((crop) => (
                        <span key={crop} className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                          {crop}
                        </span>
                      ))}
                    </div>

                    {/* Unique Profile ID */}
                    <div className="text-[11px] text-zinc-500 font-mono bg-zinc-50 p-2 rounded-xl border border-zinc-100 mb-4 flex items-center justify-between">
                      <span className="text-zinc-400 font-sans">Profile ID:</span>
                      <span className="font-bold text-zinc-800 truncate max-w-[170px]">{account.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 h-8 rounded-xl font-bold text-xs border-zinc-300">
                      <Link href={`/profile/${account.id}`}>
                        View Profile
                      </Link>
                    </Button>

                    {status === "connected" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="flex-1 h-8 rounded-xl font-bold text-xs border-emerald-500 text-emerald-700 bg-emerald-50"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Connected
                      </Button>
                    ) : status === "pending_sent" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="flex-1 h-8 rounded-xl font-bold text-xs border-amber-300 text-amber-800 bg-amber-50 cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                      </Button>
                    ) : status === "pending_received" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          const { incoming } = getUserPendingRequests(user?.id || "");
                          const req = incoming.find((r) => r.requesterId.toLowerCase() === account.id.toLowerCase());
                          if (req) handleAccept(req.id);
                        }}
                        className="flex-1 h-8 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Accept Request
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={actionInProgress === account.id}
                        onClick={() => handleConnect(account)}
                        className="flex-1 h-8 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-black text-white gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
