"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import { REAL_ACCOUNTS_20 } from "@/lib/data/userDirectory";
import { getRoleHome } from "@/lib/navigation";
import {
  Shield,
  Search,
  ArrowRight,
  Loader2,
  CheckCircle2,
  MapPin,
  Users,
  KeyRound,
  AlertTriangle,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function DeveloperPage() {
  const router = useRouter();
  const { user, isDeveloper, devSwitchAccount, logout, loginAsAccount } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [devEnabled, setDevEnabled] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const DEV_SECRET = "farmnex-dev-2024";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDevEnabled(window.localStorage.getItem("farmnex_dev_mode") === "true");
    }
  }, []);

  const handleEnableDev = () => {
    if (secretCode === DEV_SECRET) {
      window.localStorage.setItem("farmnex_dev_mode", "true");
      setDevEnabled(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Wrong developer secret code.");
    }
  };

  const filteredAccounts = REAL_ACCOUNTS_20.filter((acc) => {
    const matchesRole = roleFilter === "all" || acc.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      acc.name.toLowerCase().includes(q) ||
      acc.location.toLowerCase().includes(q) ||
      acc.role.toLowerCase().includes(q) ||
      (acc.phone && acc.phone.includes(q));
    return matchesRole && matchesQuery;
  });

  const handleSwitch = async (acc: typeof REAL_ACCOUNTS_20[0]) => {
    setSwitchingId(acc.id);
    setErrorMsg("");
    try {
      // If admin is logged in via real JWT, use the secure backend endpoint
      if (user && user.role === "admin") {
        await devSwitchAccount(acc.id);
        router.push(getRoleHome(acc.role));
      } else {
        // Fallback: use local demo login (available for any dev with access to this page)
        loginAsAccount(acc.id);
        router.push(getRoleHome(acc.role));
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setErrorMsg(err.message || "Could not switch account.");
    } finally {
      setSwitchingId(null);
    }
  };

  if (!devEnabled) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Developer Tools</h1>
              <p className="text-xs text-zinc-500">FarmNex internal access</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              This area is restricted to FarmNex developers only. Enter the developer secret code to continue.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnableDev()}
              placeholder="Developer secret code"
              className="w-full h-11 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <button
              onClick={handleEnableDev}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors"
            >
              Unlock Developer Mode
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Developer Tools</h1>
              <p className="text-[11px] text-zinc-500">
                {user ? `Logged in as: ${user.name} (${user.role})` : "Not logged in — demo switch mode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              window.localStorage.removeItem("farmnex_dev_mode");
              setDevEnabled(false);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Dev Mode
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Info banner */}
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 flex gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Account Switcher</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Switch to any test account below without needing the OTP or password.
              {user?.role === "admin" ? " You are logged in as admin — backend JWT switching is active." : " Running in demo-switch mode (no JWT required)."}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, location, or role..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "farmer", "fpo", "buyer", "consumer", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  roleFilter === r
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Account grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-amber-500/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {acc.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white truncate">{acc.name}</span>
                    {acc.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-zinc-800 font-medium">{acc.role}</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5" />
                      {acc.location}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {acc.phone ? `📱 ${acc.phone.slice(0, 5)}•••••` : acc.email ? `✉️ ${acc.email.split('@')[0].slice(0, 3)}•••@${acc.email.split('@')[1]}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSwitch(acc)}
                disabled={switchingId === acc.id}
                className="shrink-0 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {switchingId === acc.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    Switch <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          ))}
          {filteredAccounts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-zinc-600">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No accounts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
