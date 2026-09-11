"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleHome } from "@/lib/navigation";
import {
  registerNewUserAccount,
  isProfileIdTaken,
} from "@/lib/data/userDirectory";
import {
  Sprout,
  Building2,
  UsersRound,
  ShoppingBag,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithCredentials } = useUser();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"farmer" | "buyer" | "fpo" | "consumer">("farmer");

  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [name, setName] = useState("");
  const [profileId, setProfileId] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("Indore, Madhya Pradesh");
  const [farmSize, setFarmSize] = useState("12");
  const [capacity, setCapacity] = useState("5,000 Qtl/month");
  const [crops, setCrops] = useState<string[]>(["Soybean", "Wheat"]);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetFeedback = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!loginId.trim() || !loginPassword) {
      setErrorMsg("Please enter both your Profile ID and password.");
      return;
    }

    setLoading(true);
    try {
      const res = loginWithCredentials(loginId.trim(), loginPassword);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || "Invalid Profile ID or password.");
        setLoading(false);
        return;
      }
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        router.push(getRoleHome(res.user?.role));
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    const cleanId = profileId.trim().toLowerCase().replace(/^@/, "");
    if (!cleanId || cleanId.length < 3) {
      setErrorMsg("Profile ID must be at least 3 characters.");
      return;
    }

    if (isProfileIdTaken(cleanId)) {
      setErrorMsg(`Profile ID "@${cleanId}" is already taken. Please pick another.`);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = registerNewUserAccount({
        name,
        role,
        profileId: cleanId,
        password,
        phone,
        email,
        location,
        crops,
        farmSizeAcres: role === "farmer" ? parseFloat(farmSize) : undefined,
        procurementCapacity: role === "buyer" ? capacity : undefined,
      });

      if (!res.success || !res.account) {
        setErrorMsg(res.error || "Registration failed.");
        setLoading(false);
        return;
      }

      loginWithCredentials(cleanId, password);
      setSuccessMsg(`Account @${cleanId} registered successfully!`);
      setTimeout(() => {
        router.push(getRoleHome(res.account?.role));
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 mb-6 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to FarmNex Home</span>
        </Link>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">
              {mode === "login" ? "FarmNex Member Login" : "Join FarmNex Network"}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Direct agricultural trade &amp; social networking
            </p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 flex p-1 rounded-xl bg-zinc-200/70 border border-zinc-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetFeedback();
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Log In (Profile ID)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              resetFeedback();
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "register" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Register Account
          </button>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-zinc-200 sm:px-8 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                  Unique Profile ID / Mobile / Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="ramesh.patel or devendra.mandloi"
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-zinc-900 hover:bg-black text-white text-sm font-bold shadow transition flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Signing in..." : "Sign In with Profile ID"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Role selection */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold">
                  {[
                    { id: "farmer", label: "Farmer", icon: Sprout },
                    { id: "fpo", label: "FPO", icon: UsersRound },
                    { id: "buyer", label: "Buyer / Mill", icon: Building2 },
                    { id: "consumer", label: "Consumer", icon: ShoppingBag },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setRole(t.id as any)}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                          role === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!profileId) setProfileId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "."));
                    }}
                    placeholder="Ramesh Patel"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Profile ID *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                      placeholder="ramesh.patel"
                      className="w-full h-10 pl-6 pr-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Location / Mandi Belt *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sanwer, Indore, MP"
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow transition flex items-center justify-center gap-2 mt-3"
              >
                {loading ? "Registering..." : "Create Account & Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5 border-t border-zinc-100">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bank Escrow · NABL Assay · Secure Passwords</span>
          </div>
        </div>
      </div>
    </div>
  );
}
