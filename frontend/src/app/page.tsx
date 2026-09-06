"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { api, DEMO_MODE, type CropListing, type DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleHome } from "@/lib/navigation";
import { demoListings, demoDemands } from "@/lib/data/demo";
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
  Sparkles,
  BarChart3,
  X,
  Layers,
  Check,
  ChevronRight,
  Shield,
  BadgeCheck,
  ArrowUpRight,
  Clock,
  Coins,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CropLotCard from "@/components/CropLotCard";
import BuyerRequirementCard from "@/components/BuyerRequirementCard";
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

  // Marketplace preview tab state
  const [previewTab, setPreviewTab] = useState<"produce" | "requirements">("produce");

  // Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Listen for Navbar / External auth open triggers
  useEffect(() => {
    const handleAuthEvent = (e: any) => {
      if (e.detail?.role) setAuthRole(e.detail.role);
      if (e.detail?.mode) setAuthMode(e.detail.mode);
      setAuthModalOpen(true);
      resetFeedback();
    };

    window.addEventListener("open-farmnex-auth", handleAuthEvent);

    // Check URL parameters for direct links like /?auth=buyer
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      const mode = params.get("mode");
      if (auth === "farmer" || auth === "buyer" || auth === "login") {
        setAuthRole(auth === "buyer" ? "buyer" : "farmer");
        setAuthMode(mode === "register" ? "register" : "login");
        setAuthModalOpen(true);
      }
    }

    return () => window.removeEventListener("open-farmnex-auth", handleAuthEvent);
  }, []);

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

  // Preview data from actual demo fixtures
  const previewProduce = demoListings.slice(0, 3);
  const previewRequirements = demoDemands.slice(0, 3);

  return (
    <div className="w-full space-y-24 sm:space-y-32">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-border/70 bg-gradient-to-b from-background via-brand-50/20 to-background dark:via-brand-950/10">
        {/* Subtle geometric background motif */}
        <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]">
          <svg className="w-full h-full stroke-primary/15" xmlns="http://www.w3.org/2000/svg" fill="none">
            <defs>
              <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center space-y-6 sm:space-y-8">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider shadow-xs">
              <Sprout className="h-4 w-4 shrink-0" />
              <span>Direct Agricultural Commerce &amp; Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.08]">
              From Farm to Market.{" "}
              <span className="block text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                Without the Unnecessary Middlemen.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
              FarmNex connects farmers and FPOs directly with food processors and bulk buyers—powered by transparent net realization, certified moisture assays, and protected bank escrow.
            </p>

            {/* Primary Action Buttons */}
            {user ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="font-bold px-8 h-12 rounded-xl text-base shadow-md" asChild>
                  <Link href={getRoleHome(user.role)}>
                    Enter {user.name}&apos;s Workspace ({user.role.toUpperCase()})
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-bold px-6 h-12 rounded-xl text-base bg-card hover:bg-muted/40" asChild>
                  <Link href="/marketplace">Open Live Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Button
                  size="lg"
                  className="font-black px-8 h-12 rounded-xl text-base shadow-md group"
                  asChild
                >
                  <Link href="/marketplace">
                    Explore Live Marketplace
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold px-6 h-12 rounded-xl text-base bg-card/80 hover:bg-card border-border shadow-xs"
                  asChild
                >
                  <a href="#how-it-works">How FarmNex Works</a>
                </Button>
              </div>
            )}

            {/* TWO-SIDED PLATFORM VISUAL ENTRY CARDS */}
            <div className="pt-6 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              {/* Farmer / FPO Entry */}
              <div className="p-5 rounded-2xl border border-emerald-300/60 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
                      <Sprout className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                      For Sellers
                    </span>
                  </div>
                  <h2 className="text-base font-black text-foreground pt-1">Farmers &amp; Producer Collectives (FPOs)</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    List harvested lots with verified moisture assays. Rank buyer demand based on true net realization after freight.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                  <button
                    type="button"
                    onClick={() => openAuth("farmer", "login")}
                    className="inline-flex items-center text-xs font-black text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white group-hover:underline"
                  >
                    <span>Join as Farmer / FPO</span>
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Bulk Buyer / Processor Entry */}
              <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 backdrop-blur-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                      For Buyers
                    </span>
                  </div>
                  <h2 className="text-base font-black text-foreground pt-1">Food Processors &amp; Commodity Mills</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Broadcast procurement tenders, specify moisture tolerances, source from verified farmer clusters, and track multi-axle freight.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                  <button
                    type="button"
                    onClick={() => openAuth("buyer", "login")}
                    className="inline-flex items-center text-xs font-black text-blue-800 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white group-hover:underline"
                  >
                    <span>Procurement Portal Login</span>
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE MANDI BENCHMARK TICKER STRIP */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 py-2 px-4 rounded-xl bg-card/80 border border-border text-xs shadow-xs">
                <span className="font-bold text-muted-foreground uppercase text-[10px] flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> Live MP Mandi Benchmarks:
                </span>
                <span className="font-semibold text-foreground">
                  Indore Soybean: <strong className="text-emerald-800 dark:text-emerald-300">₹5,380/Q</strong> <span className="text-[10px] text-emerald-700 dark:text-emerald-400">(+₹488 vs MSP)</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-foreground">
                  Dewas Sharbati Wheat: <strong className="text-emerald-800 dark:text-emerald-300">₹2,420/Q</strong> <span className="text-[10px] text-emerald-700 dark:text-emerald-400">(+₹145 vs MSP)</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-foreground">
                  Ujjain Cotton: <strong className="text-emerald-800 dark:text-emerald-300">₹7,350/Q</strong> <span className="text-[10px] text-emerald-700 dark:text-emerald-400">(+₹229 vs MSP)</span>
                </span>
              </div>
            </div>

            {/* Quick Testing Personas Strip */}
            <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-wider text-[10px]">Test Personas:</span>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("farmer")}
                className="px-2.5 py-1 rounded-md bg-card hover:bg-muted/50 font-semibold text-foreground transition-colors border border-border shadow-2xs"
              >
                🌾 Ramesh Patel (Farmer)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("fpo")}
                className="px-2.5 py-1 rounded-md bg-card hover:bg-muted/50 font-semibold text-foreground transition-colors border border-border shadow-2xs"
              >
                🏢 Malwa FPO (Collective)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("buyer")}
                className="px-2.5 py-1 rounded-md bg-card hover:bg-muted/50 font-semibold text-foreground transition-colors border border-border shadow-2xs"
              >
                🏭 Agrocorp (Bulk Buyer)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("consumer")}
                className="px-2.5 py-1 rounded-md bg-card hover:bg-muted/50 font-semibold text-foreground transition-colors border border-border shadow-2xs"
              >
                🥗 Meera (Consumer)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin")}
                className="px-2.5 py-1 rounded-md bg-card hover:bg-muted/50 font-semibold text-foreground transition-colors border border-border shadow-2xs"
              >
                🛡️ Operations (Admin)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRUST / VALUE STRIP */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-foreground">Direct Connections</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bypass informal village brokers. Farmers and FPOs sell directly to verified food processing plants and commercial crushers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-foreground">Transparent Net Realization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every offer is calculated after freight and loading deductions. Farmers compare real pocket rupees per quintal upfront.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-foreground">Certified Moisture Assays</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent lab-calibrated moisture and impurity assays attached to every lot prevent arbitrary dockage at mill gates.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-foreground">Protected Bank Escrow</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buyer payments are deposited into protected escrow accounts before dispatch and released upon weighbridge receipt.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE PROBLEM VS THE SOLUTION (Visual Supply-Chain Contrast) */}
      {/* ========================================================================= */}
      <section id="problem-solution" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-b from-card to-muted/20 p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">The Supply-Chain Contrast</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Why agricultural trade needed a modern operating system
            </h2>
            <p className="text-sm text-muted-foreground">
              Traditional mandi trade isolates farmers through layers of intermediary markups, non-transparent weighment, and delayed payments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Traditional Chain Card */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/60 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Traditional Intermediary Model
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded">
                  4–6 Intermediaries
                </span>
              </div>

              {/* Conceptual Chain */}
              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center gap-3 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900 flex items-center justify-center text-[10px] font-black shrink-0 text-rose-900 dark:text-rose-200">1</div>
                  <span>Farmer harvests crop (takes whatever spot price is offered locally)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-[10px] font-bold shrink-0">↓</div>
                  <span>Village Aggregator / Kachha Arhatiya (takes ₹120–₹180/Q cut)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-[10px] font-bold shrink-0">↓</div>
                  <span>Mandi Commission Broker (takes 2–3% fee + unloading/dockage deductions)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-[10px] font-bold shrink-0">↓</div>
                  <span>Regional Commodity Wholesaler (stores, blends grades &amp; marks up)</span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900 flex items-center justify-center text-[10px] font-black shrink-0 text-rose-900 dark:text-rose-200">2</div>
                  <span>Processor receives mixed-quality lot after significant margin markups</span>
                </div>
              </div>

              <div className="pt-3 border-t border-rose-200/80 dark:border-rose-900/60 flex flex-wrap items-center justify-between text-xs text-rose-800 dark:text-rose-300 font-bold gap-2">
                <span>⚠ 20–35% value lost in middlemen</span>
                <span>⚠ 15–45 day payment cycles</span>
              </div>
            </div>

            {/* FarmNex Model Card */}
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  The FarmNex Direct Platform
                </span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                  Direct Trade
                </span>
              </div>

              {/* Conceptual Chain */}
              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center gap-3 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                  <span>Farmer / FPO lists produce with certified moisture assay &amp; farm-gate origin</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-[10px] font-black shrink-0 text-emerald-700">⚡</div>
                  <span>FarmNex Net Realization Engine calculates freight &amp; ranks best paying mills</span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                  <span>Food Processor contracts directly with digital weighbridge &amp; escrow terms</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-200 dark:border-emerald-900 flex flex-wrap items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold gap-2">
                <span>✓ Zero unnecessary intermediary cuts</span>
                <span>✓ Escrow released upon weighbridge slip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW FARMNEX WORKS (4-Step Visual Flow) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-primary">Simple &amp; Verifiable Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            How FarmNex Powers Direct Agricultural Trade
          </h2>
          <p className="text-sm text-muted-foreground">
            A 4-step workflow designed around real Indian mandi logistics, lab assays, and protected banking rails.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="border border-border bg-card rounded-2xl p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black">
                  1
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supply</span>
              </div>
              <h3 className="text-base font-black text-foreground">List Harvest Lots</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Farmers or FPO collectives list harvested lots with origin village, moisture assay percentage, and quantity in quintals.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              ✓ NABL moisture assay params
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border bg-card rounded-2xl p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-black">
                  2
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Intelligence</span>
              </div>
              <h3 className="text-base font-black text-foreground">Net Realization Ranking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The algorithm analyzes mill demands within 150 km, deducts transport tariffs, and displays the true net ₹/Q in the farmer&apos;s pocket.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 text-[11px] font-bold text-primary">
              ✓ Freight deducted upfront
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border bg-card rounded-2xl p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-black">
                  3
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contract</span>
              </div>
              <h3 className="text-base font-black text-foreground">Digital Agreement</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Both parties confirm rates, quality grade tolerances, delivery dates, and logistics responsibility in a binding digital contract.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 text-[11px] font-bold text-amber-900 dark:text-amber-300">
              ✓ Clear moisture tolerances
            </div>
          </div>

          {/* Step 4 */}
          <div className="border border-border bg-card rounded-2xl p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black">
                  4
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Settlement</span>
              </div>
              <h3 className="text-base font-black text-foreground">Weighbridge &amp; Escrow</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buyer deposits funds in bank escrow. Grain is weighed at certified weighbridges upon arrival, triggering instant payout release.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 text-[11px] font-bold text-teal-800 dark:text-teal-300">
              ✓ Guaranteed payment release
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TWO-SIDED PLATFORM SECTION */}
      {/* ========================================================================= */}
      <section id="for-farmers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-primary">Purpose-Built Modules</span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Tailored Experiences for Both Sides of Agricultural Commerce
          </h2>
          <p className="text-sm text-muted-foreground">
            Whether managing individual farm lots, collective FPO consolidation, or industrial mill procurement tenders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* FOR FARMERS & FPOS */}
          <div className="rounded-3xl border border-emerald-300/80 dark:border-emerald-800 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black shadow-xs">
                    <Sprout className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-foreground">For Farmers &amp; FPOs</h3>
                    <p className="text-xs text-muted-foreground">Direct farm-gate price discovery &amp; collective selling</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Seller Operating System
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">List Agricultural Lots Easily</strong>
                    <span className="text-muted-foreground">Log harvested commodity, quantity, lab moisture percentage, and preferred farm-gate pickup.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Algorithmic Net Realization Ranking</strong>
                    <span className="text-muted-foreground">Compare nearby processor offers with automatic distance and freight calculations to see true net take-home.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">FPO Volume Consolidation</strong>
                    <span className="text-muted-foreground">FPO managers pool member supplies to meet multi-ton industrial contracts at premium wholesale rates.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Frictionless Mobile OTP Access</strong>
                    <span className="text-muted-foreground">Login instantly via SMS OTP—no complicated passwords or administrative overhead required.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto font-black px-6 rounded-xl shadow-xs"
                onClick={() => openAuth("farmer", "login")}
              >
                🌾 Join as Farmer / FPO
              </Button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("farmer")}
                className="text-xs font-bold text-primary hover:underline"
              >
                Launch Ramesh Patel (Demo) →
              </button>
            </div>
          </div>

          {/* FOR BULK BUYERS & PROCESSORS */}
          <div id="for-buyers" className="rounded-3xl border border-blue-300/80 dark:border-blue-900 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-black shadow-xs">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-foreground">For Food Processors &amp; Mills</h3>
                    <p className="text-xs text-muted-foreground">Direct raw material sourcing &amp; contract fulfillment</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Procurement Workspace
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Broadcast Procurement Tenders</strong>
                    <span className="text-muted-foreground">Post monthly or seasonal volume requirements with offered rate per quintal and target delivery dates.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Define Exact Assay Tolerances</strong>
                    <span className="text-muted-foreground">Specify maximum moisture percentage, impurity cutoff, and quality grades required for your factory boilers or mills.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Source from Verified Producer Clusters</strong>
                    <span className="text-muted-foreground">Procure directly from vetted smallholders and FPOs in Sanwer, Dewas, Ujjain, and Sehore.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block font-bold">Electronic Weighbridge &amp; Escrow Rail</strong>
                    <span className="text-muted-foreground">Funds remain in protected escrow until electronic weighbridge slips verify gross and tare weight at unloading.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-black px-6 rounded-xl border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={() => openAuth("buyer", "login")}
              >
                🏭 Processor Portal Login
              </Button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("buyer")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Launch Agrocorp (Demo) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MARKETPLACE PREVIEW */}
      {/* ========================================================================= */}
      <section id="marketplace-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Live Exchange Preview</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Active Produce Lots &amp; Buyer Tenders
            </h2>
            <p className="text-xs text-muted-foreground">
              A sample of verified crop inventory and active mill procurement requirements currently trading on FarmNex.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewTab("produce")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                previewTab === "produce"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌾 Available Produce ({previewProduce.length})
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("requirements")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                previewTab === "requirements"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏭 Active Buyer Tenders ({previewRequirements.length})
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {previewTab === "produce" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewProduce.map((lot) => (
              <CropLotCard key={lot.id} listing={lot} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewRequirements.map((demand) => (
              <BuyerRequirementCard key={demand.id} demand={demand} showActions={true} />
            ))}
          </div>
        )}

        <div className="pt-2 text-center">
          <Button asChild size="lg" variant="outline" className="font-bold px-8 rounded-xl shadow-xs">
            <Link href="/marketplace">
              View All Active Lots &amp; Tenders in Marketplace
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRUST & TRANSPARENCY SECTION ("Know who you're buying from") */}
      {/* ========================================================================= */}
      <section id="trust" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 lg:p-12 space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Verification Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Know exactly who you are trading with
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every participant on FarmNex is verified with transparent location, quality track records, and enforceable digital contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-foreground">Verified Producer &amp; FPO Identity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Farmer profiles feature validated land area, village location, crop cultivation history, and FPO aggregation affiliation.
              </p>
              <div className="pt-2">
                <TrustBadge type="producer" size="sm" showPopover={true} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-foreground">Audited Processor Credentials</h3>
              <p className="text-muted-foreground leading-relaxed">
                Industrial mills and processing plants have verified factory locations, business registration records, and weighbridge facilities.
              </p>
              <div className="pt-2">
                <TrustBadge type="buyer" size="sm" showPopover={true} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-foreground">Escrow Protected Settlements</h3>
              <p className="text-muted-foreground leading-relaxed">
                No delayed 30-day cheques. Payouts are secured in escrow before vehicle dispatch and released digitally upon weighbridge confirmation.
              </p>
              <div className="pt-2">
                <TrustBadge type="fpo" size="sm" showPopover={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          <div className="relative space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Build a more direct agricultural marketplace.
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 leading-relaxed font-normal">
              Whether you are a farmer with a 200Q harvest, an FPO pooling member lots, or an oilseed processor in Dewas—FarmNex connects you directly.
            </p>
          </div>

          <div className="relative flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/95 font-black px-8 h-12 shadow-md rounded-xl text-sm"
              onClick={() => openAuth("farmer", "login")}
            >
              Get Started as Farmer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-bold px-8 h-12 rounded-xl text-sm"
              onClick={() => openAuth("buyer", "login")}
            >
              Join as Processor / Buyer
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 font-semibold px-6 h-12 rounded-xl text-sm"
              asChild
            >
              <Link href="/marketplace">Explore Marketplace →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. MODAL AUTHENTICATION DIALOG (Farmer OTP & Buyer Email Login) */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/40 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
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
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-xl text-xs font-bold border border-border/60">
              <button
                type="button"
                onClick={() => {
                  setAuthRole("farmer");
                  resetFeedback();
                }}
                className={`py-2 rounded-lg transition-all ${
                  authRole === "farmer" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🌾 Farmer / FPO
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthRole("buyer");
                  resetFeedback();
                }}
                className={`py-2 rounded-lg transition-all ${
                  authRole === "buyer" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🏭 Bulk Buyer / Mill
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
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
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">We will send a 6-digit verification code.</p>
                    </div>

                    <Button type="submit" className="w-full font-bold h-10 rounded-lg" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>

                    <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
                      <span>Quick testing persona: </span>
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
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Farm Location / Mandi</label>
                      <input
                        type="text"
                        value={farmerLocation}
                        onChange={(e) => setFarmerLocation(e.target.value)}
                        placeholder="Indore, MP"
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">FPO Name (Optional)</label>
                      <input
                        type="text"
                        value={farmerFpo}
                        onChange={(e) => setFarmerFpo(e.target.value)}
                        placeholder="Malwa Kisan Samriddhi FPO"
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold h-10 rounded-lg" disabled={loading}>
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
                        className="w-full px-3 py-2 text-center tracking-widest text-lg font-black border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1 text-center">
                        Development OTP code is <strong>123456</strong>
                      </p>
                    </div>

                    <Button type="submit" className="w-full font-bold h-10 rounded-lg" disabled={loading}>
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
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
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
                          className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full font-bold h-10 rounded-lg" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in to Procurement"}
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
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
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Anita Sharma"
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Business Email</label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="procurement@agrocorp.in"
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Password</label>
                      <input
                        type="password"
                        value={buyerPassword}
                        onChange={(e) => setBuyerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold h-10 rounded-lg" disabled={loading}>
                      {loading ? "Registering..." : "Create Buyer Account"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-muted-foreground hover:text-foreground block w-full text-center pt-1"
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
