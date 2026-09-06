"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { api, DEMO_MODE, type CropListing, type DemandPost, type UserProfile } from "@/lib/api";
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
  X,
  ChevronRight,
  Shield,
  BadgeCheck,
  ArrowUpRight,
  Clock,
  Layers,
  Check,
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
    } catch {
      // In demo/offline mode, fallback seamlessly so user can proceed
      setOtpSent(true);
      setSuccessMsg("Demo verification code is 123456");
      setFarmerOtp("123456");
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
      setSuccessMsg(`Welcome, ${res.user?.name || "Farmer"}!`);
      setAuthModalOpen(false);
      router.push("/farmer");
    } catch (err: any) {
      if (farmerOtp === "123456" || DEMO_MODE) {
        switchDemoRole("farmer");
        setAuthModalOpen(false);
        router.push("/farmer");
        return;
      }
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
    } catch {
      // Demo fallback user
      const demoUser: UserProfile = {
        id: `farmer-${Date.now()}`,
        name: farmerName,
        phone: farmerPhone,
        role: "farmer",
        language_pref: "en",
        verified: true,
        created_at: new Date().toISOString(),
        farmer_profile: {
          location: farmerLocation || "Indore, Madhya Pradesh",
          lat: 22.7196,
          lng: 75.8577,
          fpo_name: farmerFpo || "Malwa Kisan Samriddhi FPO",
        },
      };
      setUser(demoUser, "demo");
      setAuthModalOpen(false);
      router.push("/farmer");
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
      setSuccessMsg(`Welcome, ${res.user?.name || "Buyer"}!`);
      setAuthModalOpen(false);
      router.push("/buyer");
    } catch {
      // Demo fallback buyer
      switchDemoRole("buyer");
      setAuthModalOpen(false);
      router.push("/buyer");
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
    } catch {
      // Demo fallback buyer
      const demoUser: UserProfile = {
        id: `buyer-${Date.now()}`,
        name: buyerName,
        email: buyerEmail,
        role: "buyer",
        language_pref: "en",
        verified: true,
        created_at: new Date().toISOString(),
        buyer_profile: {
          business_name: businessName,
          gst_verified: true,
          location: buyerLocation || "Dewas Industrial Area, Madhya Pradesh",
          lat: 22.9676,
          lng: 76.0534,
        },
      };
      setUser(demoUser, "demo");
      setAuthModalOpen(false);
      router.push("/buyer");
    } finally {
      setLoading(false);
    }
  };

  // Preview data from actual demo fixtures
  const previewProduce = demoListings.slice(0, 3);
  const previewRequirements = demoDemands.slice(0, 3);

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* ========================================================================= */}
      {/* 1. VISUAL HERO SECTION (DOMINANT AGRICULTURAL PHOTOGRAPHY) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center justify-center overflow-hidden bg-zinc-950">
        {/* Dominant Agricultural Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-farm.jpg"
            alt="Vast Indian agricultural farmlands during golden hour morning harvest"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Elegant dark green cinematic overlay to ensure razor-sharp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/75 to-zinc-950/40" />
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Message (Short, Powerful, Non-editorial) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Clean Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold tracking-wide">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                <span>Direct Agricultural Commerce</span>
              </div>

              {/* Headline: Clean, bold, sans-serif */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                From Farm<br />
                to Market.{" "}
                <span className="text-emerald-400">Directly.</span>
              </h1>

              {/* Short Supporting Text (Max 2 lines, no technical jargon) */}
              <p className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed font-normal">
                FarmNex connects farmers and FPOs directly with consumers and bulk buyers, making agricultural trade more transparent and efficient.
              </p>

              {/* Action Buttons */}
              {user ? (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Button size="lg" className="font-bold px-8 h-12 rounded-xl text-base shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white" asChild>
                    <Link href={getRoleHome(user?.role)}>
                      Enter {user?.name || "User"}&apos;s Workspace
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="font-bold px-6 h-12 rounded-xl text-base bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md" asChild>
                    <Link href="/marketplace">Open Live Marketplace</Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Button
                    size="lg"
                    className="font-bold px-8 h-12 rounded-xl text-base shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white group"
                    asChild
                  >
                    <Link href="/marketplace">
                      Explore Marketplace
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-semibold px-6 h-12 rounded-xl text-base bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md shadow-xs"
                    asChild
                  >
                    <a href="#how-it-works">How It Works</a>
                  </Button>
                </div>
              )}

              {/* Subtle Testing Personas Strip */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Quick Demo Access:</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("farmer")}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors border border-white/10 text-xs font-medium"
                >
                  🌾 Ramesh (Farmer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("buyer")}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors border border-white/10 text-xs font-medium"
                >
                  🏭 Agrocorp (Buyer)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("fpo")}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors border border-white/10 text-xs font-medium"
                >
                  🏢 Malwa FPO
                </button>
              </div>
            </div>

            {/* Right Side: Sophisticated Floating Product Card (Real FarmNex Data Storytelling) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950/80 backdrop-blur-xl p-5 sm:p-6 text-white shadow-2xl space-y-4">
                {/* Header status */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Live Verified Lot
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    Sanwer, Indore (MP)
                  </span>
                </div>

                {/* Produce & Producer */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Soybean (JS-335)</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      Grade A Assayed
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Producer: Ramesh Patel · Malwa Kisan FPO</span>
                  </p>
                </div>

                {/* Real Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Quantity</span>
                    <span className="text-base font-black text-white">320 Quintals</span>
                    <span className="text-[10px] text-zinc-400 block">(32 Tonnes lot)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Lab Moisture</span>
                    <span className="text-base font-black text-emerald-400">10.4% Assayed</span>
                    <span className="text-[10px] text-zinc-400 block">(Within mill tolerance)</span>
                  </div>
                </div>

                {/* Price & Realization */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Asking Rate</span>
                    <p className="text-xl font-black text-white">
                      ₹5,380 <span className="text-xs font-normal text-zinc-400">/ Quintal</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Net Realization</span>
                    <p className="text-xs font-bold text-emerald-300">
                      +₹488 vs Mandi Spot
                    </p>
                  </div>
                </div>

                {/* Trust Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    Bank Escrow Protected
                  </span>
                  <Link
                    href="/marketplace"
                    className="text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
                  >
                    View in Market <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TWO AUDIENCES (LIGHT & COMPACT INTEGRATION) */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Built for both sides of the farm-to-market network
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A transparent operating platform connecting producers directly with bulk commercial demand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Farmers & FPOs */}
            <div className="p-5 rounded-xl border border-border/80 bg-muted/20 hover:border-emerald-500/40 transition-colors flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                      <Sprout className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-black text-foreground">For Farmers &amp; FPOs</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Sellers
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  List harvest lots with lab moisture assays, compare mill demand by net pocket realization after freight, and eliminate broker markups.
                </p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => openAuth("farmer", "login")}
                  className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  <span>Join as Farmer / FPO</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </button>
              </div>
            </div>

            {/* Buyers & Processors */}
            <div className="p-5 rounded-xl border border-border/80 bg-muted/20 hover:border-blue-500/40 transition-colors flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-black text-foreground">For Food Processors &amp; Mills</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Buyers
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Broadcast procurement tenders, specify moisture tolerances, source from verified producer clusters, and settle via protected escrow.
                </p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => openAuth("buyer", "login")}
                  className="inline-flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <span>Explore as a Buyer</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BELOW HERO: CLEAN TRANSITION & 4 PILLARS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Direct Value</span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            One platform. Direct trade.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A transparent agricultural workflow designed for clear origin, verified quality, and secure settlement.
          </p>
        </div>

        {/* Visual Flow Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-3 px-4 rounded-xl bg-card border border-border text-xs font-bold text-muted-foreground max-w-2xl mx-auto shadow-2xs">
          <span className="text-foreground">FARMER / FPO</span>
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary font-black bg-primary/10 px-2.5 py-1 rounded">FARMNEX</span>
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">BUYER / CONSUMER</span>
        </div>

        {/* 4 Short Benefits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-foreground">Direct Connections</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Bypass informal village brokers. Farmers and FPOs contract directly with food processing plants.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Scale className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-foreground">Transparent Net Realization</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Transport freight calculated upfront so farmers know exact pocket earnings per quintal.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-foreground">Lab-Assayed Quality</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Calibrated moisture and impurity assays attached to every lot prevent mill-gate dockage disputes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-foreground">Protected Bank Escrow</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Payments secured in escrow prior to truck dispatch and released upon weighbridge receipt.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROBLEM -> SOLUTION VISUAL DIAGRAM */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="max-w-xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Supply Chain Contrast</span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              The problem with traditional agricultural trade
            </h2>
            <p className="text-xs text-muted-foreground">
              Multi-tiered broker markups reduce farmer income while adding cost and quality uncertainty for buyers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* TRADITIONAL CHAIN */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/60 pb-2.5">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  Traditional Intermediary Model
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                  4–6 Intermediaries
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="flex h-5 w-5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Farmer harvests crop (local price taker)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground pl-1">
                  <span className="text-xs font-bold text-rose-500">↓</span>
                  <span>Village Aggregator (takes ₹120–₹180/Q margin)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground pl-1">
                  <span className="text-xs font-bold text-rose-500">↓</span>
                  <span>Mandi Commission Broker (dockage &amp; 2–3% fee)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground pl-1">
                  <span className="text-xs font-bold text-rose-500">↓</span>
                  <span>Regional Commodity Wholesaler (marks up price)</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="flex h-5 w-5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Processor receives crop at inflated price</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between text-[11px] font-bold text-rose-800 dark:text-rose-300">
                <span>⚠ 20–35% margin lost</span>
                <span>⚠ 15–45 day payment delays</span>
              </div>
            </div>

            {/* FARMNEX DIRECT CHAIN */}
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900 pb-2.5">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  FarmNex Direct Model
                </span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  Direct Trade
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Farmer / FPO lists lot with certified moisture assay</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-semibold pl-1">
                  <span className="text-xs font-black text-emerald-600">⚡</span>
                  <span>FarmNex ranks buyers based on true pocket net realization</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Buyer contracts directly with digital weighbridge &amp; escrow terms</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <span>✓ Zero broker cuts</span>
                <span>✓ Escrow released upon weighbridge slip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MARKETPLACE PRODUCT PREVIEW (REAL PRODUCT PREVIEW) */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Browser / App Header */}
          <div className="border-b border-border bg-muted/40 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <span className="text-xs font-black text-foreground">FarmNex Live Marketplace</span>
            </div>

            {/* Product Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-background border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab("produce")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === "produce"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🌾 Available Lots ({previewProduce.length})
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("requirements")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === "requirements"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🏭 Active Buyer Tenders ({previewRequirements.length})
              </button>
            </div>
          </div>

          {/* Cards Content */}
          <div className="p-6 sm:p-8">
            {previewTab === "produce" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {previewProduce.map((lot) => (
                  <CropLotCard key={lot.id} listing={lot} showActions={true} />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {previewRequirements.map((demand) => (
                  <BuyerRequirementCard key={demand.id} demand={demand} showActions={true} />
                ))}
              </div>
            )}

            <div className="pt-6 text-center border-t border-border mt-6">
              <Button asChild size="lg" className="font-bold px-8 rounded-xl shadow-xs" variant="outline">
                <Link href="/marketplace">
                  View Full Live Marketplace
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FARMER EXPERIENCE (IMAGE + PRODUCT POINTS) */}
      {/* ========================================================================= */}
      <section id="for-farmers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs grid lg:grid-cols-12 items-center">
          {/* Left Visual: Indian Farmer Harvest Photography */}
          <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[380px]">
            <Image
              src="/images/farmer-harvest.jpg"
              alt="Indian farmer holding freshly harvested crop produce in farm field"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold border border-white/20 inline-block">
                Direct Farm-Gate Procurement
              </span>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                For Farmers &amp; FPOs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                List your produce. Reach relevant buyers.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Empowering smallholders and collectives to take charge of their agricultural harvest with transparent pocket pricing.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">List Lots with Lab Moisture Assays</strong>
                  <span className="text-muted-foreground">Attach certified moisture and foreign matter parameters to prevent arbitrary mill-gate deductions.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Algorithmic Net Realization Ranking</strong>
                  <span className="text-muted-foreground">Compare offers from nearby mills with freight and transport tariffs calculated upfront.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">FPO Volume Consolidation</strong>
                  <span className="text-muted-foreground">Pool member supplies to fulfill multi-ton industrial contracts at premium wholesale rates.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Frictionless Mobile OTP Access</strong>
                  <span className="text-muted-foreground">Sign in instantly via 6-digit phone OTP—no complicated passwords or paperwork.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                size="lg"
                className="font-bold px-6 rounded-xl shadow-xs"
                onClick={() => openAuth("farmer", "login")}
              >
                Join as a Farmer
              </Button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("farmer")}
                className="text-xs font-bold text-primary hover:underline text-left sm:text-center"
              >
                Quick Demo: Ramesh Patel →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BUYER EXPERIENCE (IMAGE + PRODUCT POINTS) */}
      {/* ========================================================================= */}
      <section id="for-buyers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs grid lg:grid-cols-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-6 order-2 lg:order-1">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                For Food Processors &amp; Bulk Buyers
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Discover verified supply. Source in bulk.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect directly with vetted producer collectives and farm-gate lots with certified quality standards.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Broadcast Procurement Tenders</strong>
                  <span className="text-muted-foreground">Post volume requirements with target rates, moisture limits, and desired delivery timelines.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Define Exact Quality Tolerances</strong>
                  <span className="text-muted-foreground">Filter produce by certified moisture cutoff and grain grade needed for commercial milling.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Direct Producer Cluster Sourcing</strong>
                  <span className="text-muted-foreground">Procure directly from vetted smallholders and FPOs across Madhya Pradesh.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-bold block">Weighbridge &amp; Escrow Rails</strong>
                  <span className="text-muted-foreground">Funds are held safely in escrow and released digitally upon certified weighbridge receipt.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="font-bold px-6 rounded-xl border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={() => openAuth("buyer", "login")}
              >
                Explore as a Buyer
              </Button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("buyer")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline text-left sm:text-center"
              >
                Quick Demo: Agrocorp Mills →
              </button>
            </div>
          </div>

          {/* Right Visual: Quality Grain Procurement & Laboratory Assay */}
          <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[380px] order-1 lg:order-2">
            <Image
              src="/images/grain-procurement.jpg"
              alt="Agricultural grain quality testing and modern processing facility"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-black/30" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold border border-white/20 inline-block">
                Industrial Grain Quality Testing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. TRUST & VERIFICATION SECTION */}
      {/* ========================================================================= */}
      <section id="trust" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Verification</span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Know where your produce comes from
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct trade backed by verified participant identities, calibrated lab assays, and protected banking rails.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <BadgeCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-foreground">Verified Producer &amp; FPO Identity</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Farmer profiles feature validated village locations, crop cultivation history, and FPO aggregation affiliations.
              </p>
              <div className="pt-1">
                <TrustBadge type="producer" size="sm" showPopover={true} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-foreground">Audited Buyer Credentials</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Commercial mills and processing plants have verified factory locations, business registration records, and weighbridge facilities.
              </p>
              <div className="pt-1">
                <TrustBadge type="buyer" size="sm" showPopover={true} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-foreground">Escrow Protected Settlements</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                No delayed cheques. Payouts are secured in escrow prior to dispatch and released digitally upon weighbridge confirmation.
              </p>
              <div className="pt-1">
                <TrustBadge type="fpo" size="sm" showPopover={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CALL TO ACTION (VISUAL BANNER) */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[320px] flex items-center justify-center text-center p-8 sm:p-12">
          {/* Background Agricultural Visual */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/cta-agriculture.jpg"
              alt="Panoramic Indian agricultural farmland at twilight"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-5 text-white">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Make agricultural trade more direct.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
              Whether you are a farmer with a harvested lot, an FPO pooling member produce, or an oilseed mill—FarmNex connects you directly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-6 h-11 rounded-xl text-xs shadow-md"
                onClick={() => openAuth("farmer", "login")}
              >
                Get Started as Farmer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-bold px-6 h-11 rounded-xl text-xs backdrop-blur-xs"
                onClick={() => openAuth("buyer", "login")}
              >
                Join as Buyer
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 font-semibold px-4 h-11 rounded-xl text-xs"
                asChild
              >
                <Link href="/marketplace">Explore Marketplace →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MODAL AUTHENTICATION DIALOG (Farmer OTP & Buyer Email Login) */}
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
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
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
