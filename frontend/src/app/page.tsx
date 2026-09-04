"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { api, DEMO_MODE } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleHome } from "@/lib/navigation";
import {
  Sprout,
  Store,
  ArrowRight,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  ShieldCheck,
  Building2,
  Mail,
  MapPin,
  UsersRound,
  FileCheck2,
  Scale,
  Award,
  Sparkles,
  BarChart3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TrustBadge from "@/components/TrustBadge";

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUser, switchDemoRole } = useUser();

  // Modal Auth State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"farmer" | "buyer">("farmer");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Farmer OTP fields
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerOtp, setFarmerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [farmerName, setFarmerName] = useState("");
  const [farmerLocation, setFarmerLocation] = useState("Indore, Madhya Pradesh");
  const [farmerFpo, setFarmerFpo] = useState("");

  // Buyer login/register fields
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [buyerLocation, setBuyerLocation] = useState("Dewas, Madhya Pradesh");

  // Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetFeedback = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const openAuth = (role: "farmer" | "buyer", mode: "login" | "register" = "login") => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
    resetFeedback();
  };

  const handleQuickDemoLogin = (role: "farmer" | "fpo" | "buyer" | "consumer" | "admin") => {
    switchDemoRole(role);
    setAuthModalOpen(false);
    router.push(getRoleHome(role));
  };

  const handleSendFarmerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!farmerPhone || farmerPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendFarmerOTP(farmerPhone);
      setOtpSent(true);
      setSuccessMsg(res.message);
      setFarmerOtp("123456"); // Pre-fill development OTP
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFarmerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      const res = await api.verifyFarmerOTP(farmerPhone, farmerOtp);
      setUser(res.user);
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      setAuthModalOpen(false);
      router.push("/farmer");
    } catch (err: any) {
      if (err.status === 404 || (err.message && (err.message.includes("not yet registered") || err.message.includes("not registered")))) {
        setAuthMode("register");
        setErrorMsg("Phone verified! Enter your name and location to complete registration.");
      } else {
        setErrorMsg(err.message || "Invalid OTP code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!farmerName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.registerFarmer({
        phone: farmerPhone,
        name: farmerName,
        language_pref: "en",
        location: farmerLocation,
        lat: 22.7196,
        lng: 75.8577,
        fpo_name: farmerFpo || undefined,
      });
      setUser(res.user);
      setSuccessMsg("Registration complete!");
      setAuthModalOpen(false);
      router.push("/farmer");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      const res = await api.loginBuyer(buyerEmail, buyerPassword);
      setUser(res.user);
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      setAuthModalOpen(false);
      router.push("/buyer");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (!businessName.trim() || !buyerName.trim()) {
      setErrorMsg("Please provide your business and contact name.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.registerBuyer({
        email: buyerEmail,
        password: buyerPassword,
        name: buyerName,
        business_name: businessName,
        language_pref: "en",
        location: buyerLocation,
        lat: 22.9676,
        lng: 76.0534,
      });
      setUser(res.user);
      setSuccessMsg("Buyer registration complete!");
      setAuthModalOpen(false);
      router.push("/buyer");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20 py-6 sm:py-10">
      {/* HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold">
          <Sprout className="h-4 w-4" />
          <span>Agricultural Professional Network & Direct Marketplace</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
          A professional network and marketplace built for agriculture.
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect with farmers, FPOs, processors, and consumers. Discover real opportunities, compare net farm-gate outcomes, and manage transparent transactions.
        </p>

        {user ? (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="font-bold px-8 h-12 rounded-lg text-base shadow-md" asChild>
              <Link href={getRoleHome(user.role)}>
                Continue as {user.name} ({user.role})
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-bold px-6 h-12 rounded-lg text-base" asChild>
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="font-bold px-8 h-12 rounded-lg text-base shadow-md"
              asChild
            >
              <Link href="/marketplace">
                Explore FarmNex
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-bold px-6 h-12 rounded-lg text-base bg-card hover:bg-muted/40"
              onClick={() => openAuth("farmer", "login")}
            >
              Join as Farmer
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="font-semibold text-muted-foreground hover:text-foreground text-sm"
              onClick={() => openAuth("buyer", "login")}
            >
              Buyer / FPO Sign In
            </Button>
          </div>
        )}

        {/* Quick Testing Personas Strip */}
        <div className="pt-6 border-t border-border mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="font-bold uppercase tracking-wider text-[10px]">Instant Demo Roles:</span>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("farmer")}
            className="px-2.5 py-1 rounded bg-muted/40 hover:bg-muted font-semibold text-foreground transition-colors"
          >
            🌾 Ramesh Patel (Farmer)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("fpo")}
            className="px-2.5 py-1 rounded bg-muted/40 hover:bg-muted font-semibold text-foreground transition-colors"
          >
            🏢 Malwa FPO (Collective)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("buyer")}
            className="px-2.5 py-1 rounded bg-muted/40 hover:bg-muted font-semibold text-foreground transition-colors"
          >
            🏭 Agrocorp (Bulk Buyer)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("consumer")}
            className="px-2.5 py-1 rounded bg-muted/40 hover:bg-muted font-semibold text-foreground transition-colors"
          >
            🥗 Meera (Consumer)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("admin")}
            className="px-2.5 py-1 rounded bg-muted/40 hover:bg-muted font-semibold text-foreground transition-colors"
          >
            🛡️ Operations (Admin)
          </button>
        </div>
      </section>

      {/* 5 CORE PILLARS */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            An ecosystem built for agricultural commerce
          </h2>
          <p className="text-sm text-muted-foreground">
            Replacing informal brokerage with transparent contracts, freight calculations, and community intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Marketplace */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Direct Crop Marketplace</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              List harvested lots with verified moisture, grade, and farm location. Compare nearby processor demand without middleman markups.
            </p>
            <div className="pt-2">
              <Link href="/marketplace" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Browse available produce <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Best Net Realization */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Best Net Realization Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Do not be fooled by high headline prices 200 km away. FarmNex computes freight deductions to reveal the true rupees per quintal kept in your pocket.
            </p>
            <div className="pt-2">
              <Link href="/farmer/buyers" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                See how matches rank <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Professional Network */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <UsersRound className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Agricultural Network Feed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time updates on local harvest yields, buyer procurement tenders, custom hiring machinery, and validated agronomic advice.
            </p>
            <div className="pt-2">
              <Link href="/network" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Join the conversation <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 4: Procurement Workspace */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Bulk Procurement for Mills</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Industrial processors broadcast volume tenders, specify moisture tolerances, view verified smallholder clusters, and contract multi-axle freight.
            </p>
            <div className="pt-2">
              <Link href="/buyer/procurement" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                View procurement tools <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 5: Market Intelligence */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Market Advisory & Trends</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent 30-day and 6-month mandi price movements across Madhya Pradesh. Actionable advice on whether to sell or hold.
            </p>
            <div className="pt-2">
              <Link href="/intelligence" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Inspect mandi benchmarks <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 6: Verifiable Trust & Settlements */}
          <div className="border border-border bg-card rounded-lg p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Trust & Settlement Workspace</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Digital trade agreements, certified weighbridge receipts, escrow confirmation, and honest non-live milestone delivery logs.
            </p>
            <div className="pt-2">
              <Link href="/orders" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Explore deals workspace <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-primary text-primary-foreground rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-lg">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Ready to trade with transparent net realization?
        </h2>
        <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
          Whether you are a farmer with a 200Q harvest, an FPO pooling member lots, or an oilseed crusher in Dewas, FarmNex is built for you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-12 shadow-md text-sm"
            onClick={() => openAuth("farmer", "login")}
          >
            Get Started as Farmer
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 font-bold px-8 h-12 text-sm"
            onClick={() => openAuth("buyer", "login")}
          >
            Create Buyer Account
          </Button>
        </div>
      </section>

      {/* AUTHENTICATION MODAL DIALOG */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
                  <Sprout className="h-4 w-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  FarmNex Authentication
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground">
                {authRole === "farmer" ? "Farmer & Producer Access" : "Processor & Bulk Buyer Access"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {authRole === "farmer"
                  ? "Fast mobile OTP verification for farm-gate sales."
                  : "Commercial account for oil mills, traders, and institutional buyers."}
              </p>
            </div>

            {/* Role switch toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthRole("farmer");
                  resetFeedback();
                }}
                className={`py-1.5 rounded transition-colors ${
                  authRole === "farmer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Farmer / FPO
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthRole("buyer");
                  resetFeedback();
                }}
                className={`py-1.5 rounded transition-colors ${
                  authRole === "buyer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulk Buyer
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FARMER FORM */}
            {authRole === "farmer" && (
              <div className="space-y-4">
                {!otpSent && authMode === "login" ? (
                  <form onSubmit={handleSendFarmerOtp} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={farmerPhone}
                          onChange={(e) => setFarmerPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">We will send a 6-digit verification code.</p>
                    </div>

                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>

                    <div className="pt-2 text-center text-xs text-muted-foreground">
                      <span>Testing account: </span>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin("farmer")}
                        className="text-primary font-bold hover:underline ml-1"
                      >
                        Auto-login as Ramesh Patel
                      </button>
                    </div>
                  </form>
                ) : authMode === "register" ? (
                  <form onSubmit={handleFarmerRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        placeholder="Ramesh Patel"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Farm Location / Mandi</label>
                      <input
                        type="text"
                        value={farmerLocation}
                        onChange={(e) => setFarmerLocation(e.target.value)}
                        placeholder="Indore, MP"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">FPO Name (Optional)</label>
                      <input
                        type="text"
                        value={farmerFpo}
                        onChange={(e) => setFarmerFpo(e.target.value)}
                        placeholder="Malwa Kisan Samriddhi FPO"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "Registering..." : "Complete Registration"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyFarmerOtp} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        value={farmerOtp}
                        onChange={(e) => setFarmerOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-3 py-2 text-center tracking-widest text-lg font-black border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1 text-center">
                        Development OTP code is <strong>123456</strong>
                      </p>
                    </div>

                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-muted-foreground hover:text-foreground block w-full text-center"
                    >
                      Use a different number
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* BUYER FORM */}
            {authRole === "buyer" && (
              <div className="space-y-4">
                {authMode === "login" ? (
                  <form onSubmit={handleBuyerLogin} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Business Email</label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="buyer1@agrocorp.in"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                        <input
                          type="password"
                          value={buyerPassword}
                          onChange={(e) => setBuyerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in to Procurement"}
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin("buyer")}
                        className="text-primary font-bold hover:underline"
                      >
                        Auto-login as Agrocorp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("register");
                          resetFeedback();
                        }}
                        className="text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Register new mill
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleBuyerRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Business / Mill Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Agrocorp Central Processing"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Anita Sharma"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Business Email</label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="procurement@agrocorp.in"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Password</label>
                      <input
                        type="password"
                        value={buyerPassword}
                        onChange={(e) => setBuyerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "Registering..." : "Create Buyer Account"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-muted-foreground hover:text-foreground block w-full text-center"
                    >
                      Already registered? Sign in
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
