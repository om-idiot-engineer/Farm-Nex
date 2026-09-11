"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleHome } from "@/lib/navigation";
import { demoListings, demoDemands } from "@/lib/data/demo";
import {
  registerNewUserAccount,
  isProfileIdTaken,
  getAllAccounts,
} from "@/lib/data/userDirectory";
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
  Eye,
  EyeOff,
  UserCheck,
  Play,
  Globe,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import CropLotCard from "@/components/CropLotCard";
import BuyerRequirementCard from "@/components/BuyerRequirementCard";
import TrustBadge from "@/components/TrustBadge";

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loginWithCredentials, logout } = useUser();

  // Scroll state for fixed glass header
  const [scrolled, setScrolled] = useState(false);

  // Unified Authentication Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authRole, setAuthRole] = useState<"farmer" | "buyer" | "fpo" | "consumer">("farmer");

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regProfileId, setRegProfileId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regLocation, setRegLocation] = useState("Indore, Madhya Pradesh");
  const [regCrops, setRegCrops] = useState<string[]>(["Soybean", "Wheat"]);
  const [regFarmSize, setRegFarmSize] = useState("12");
  const [regCapacity, setRegCapacity] = useState("5,000 Qtl/month");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regFpoName, setRegFpoName] = useState("");
  const [regHeadline, setRegHeadline] = useState("");
  const [regAbout, setRegAbout] = useState("");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Marketplace preview tab
  const [previewTab, setPreviewTab] = useState<"produce" | "requirements">("produce");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for open-farmnex-auth events or URL params
  useEffect(() => {
    const handleAuthEvent = (e: any) => {
      if (e.detail?.role) setAuthRole(e.detail.role);
      if (e.detail?.mode) setAuthMode(e.detail.mode);
      setAuthModalOpen(true);
      resetFeedback();
    };

    window.addEventListener("open-farmnex-auth", handleAuthEvent);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      const mode = params.get("mode");
      if (auth || mode) {
        if (auth === "buyer" || auth === "farmer" || auth === "fpo" || auth === "consumer") {
          setAuthRole(auth);
        }
        if (mode === "register" || mode === "login") {
          setAuthMode(mode);
        }
        setAuthModalOpen(true);
      }
    }

    return () => window.removeEventListener("open-farmnex-auth", handleAuthEvent);
  }, []);

  const resetFeedback = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const openAuth = (role: "farmer" | "buyer" | "fpo" | "consumer", mode: "login" | "register" = "login") => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
    resetFeedback();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Image fallback helper
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = "none";
    const sibling = target.nextElementSibling as HTMLElement;
    if (sibling) sibling.style.display = "block";
  };

  // -------------------------------------------------------------
  // Handle Login via Profile ID + Password
  // -------------------------------------------------------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!loginIdentifier.trim()) {
      setErrorMsg("Please enter your unique Profile ID, email, or registered phone.");
      return;
    }

    if (!loginPassword) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    setLoading(true);
    try {
      const result = loginWithCredentials(loginIdentifier.trim(), loginPassword);
      if (!result.success || !result.user) {
        setErrorMsg(result.error || "Invalid credentials. Please check your Profile ID & password.");
        setLoading(false);
        return;
      }

      setSuccessMsg(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        setAuthModalOpen(false);
        router.push(getRoleHome(result.user?.role));
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Handle Registration with Unique Profile ID + Password
  // -------------------------------------------------------------
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!regName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanProfileId = regProfileId.trim().toLowerCase().replace(/^@/, "");
    if (!cleanProfileId || cleanProfileId.length < 3) {
      setErrorMsg("Please choose a unique Profile ID (at least 3 characters, e.g. ramesh.patel).");
      return;
    }

    if (isProfileIdTaken(cleanProfileId)) {
      setErrorMsg(`Profile ID "@${cleanProfileId}" is already taken by another registered member. Please pick a unique handle.`);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg("Please choose a secure password of at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const regResult = registerNewUserAccount({
        name: regName,
        role: authRole,
        profileId: cleanProfileId,
        password: regPassword,
        phone: regPhone,
        email: regEmail,
        location: regLocation,
        crops: regCrops,
        farmSizeAcres: parseFloat(regFarmSize) || undefined,
        procurementCapacity: authRole === "buyer" ? regCapacity : undefined,
        businessName: authRole === "buyer" ? (regBusinessName || regName) : undefined,
        fpoName: authRole === "fpo" ? (regFpoName || regName) : regFpoName,
        headline: regHeadline,
        about: regAbout,
      });

      if (!regResult.success || !regResult.account) {
        setErrorMsg(regResult.error || "Registration failed. Please review your details.");
        setLoading(false);
        return;
      }

      // Automatically log the user in with their newly created credentials
      const logResult = loginWithCredentials(cleanProfileId, regPassword);
      setSuccessMsg(`Account @${cleanProfileId} created successfully! Logging you in...`);

      setTimeout(() => {
        setAuthModalOpen(false);
        router.push(getRoleHome(regResult.account?.role));
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const previewProduce = demoListings.slice(0, 3);
  const previewRequirements = demoDemands.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 antialiased selection:bg-emerald-200">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION (SMOOTH GLASSBAR WITH DIRECT AUTH & ROUTING) */}
      {/* ------------------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-zinc-200 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.12)]"
            : "bg-transparent border-transparent lg:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.4),transparent)]"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 shrink-0 group text-left"
          >
            <div className="w-9 h-9 rounded-[10px] bg-emerald-500 flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className={`font-extrabold tracking-tight text-[20px] ${scrolled ? "text-zinc-900" : "text-white"} transition-colors`}>
              FarmNex
            </span>
            <span className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest ${scrolled ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"} transition-colors`}>
              V3
            </span>
          </button>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: "Platform", id: "platform" },
              { label: "For Farmers", id: "for-farmers" },
              { label: "For Buyers", id: "for-buyers" },
              { label: "How it Works", id: "how-it-works" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-3.5 h-8 rounded-full text-[13.5px] font-medium transition ${
                  scrolled
                    ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => showToast("Language: English · Hindi & Marathi coming soon")}
              className={`hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border text-[13px] font-medium transition ${
                scrolled
                  ? "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  : "bg-white/10 border-white/20 text-white/90 hover:bg-white/15 backdrop-blur"
              }`}
            >
              <Globe className="w-4 h-4" /> EN
            </button>

            <button
              onClick={() => openAuth("farmer", "login")}
              className={`inline-flex h-9 px-4 rounded-full text-[14px] font-medium transition items-center ${
                scrolled ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100" : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Log in
            </button>

            <button
              onClick={() => openAuth("farmer", "register")}
              className="inline-flex items-center gap-1.5 h-[42px] px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-semibold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.45)] hover:-translate-y-[1px] transition-all"
            >
              <span>Join FarmNex</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH AGRICULTURAL PHOTOGRAPHY & COOL MODERN TAGLINE */}
      {/* ------------------------------------------------------------------------- */}
      <section id="platform" className="relative w-full overflow-hidden bg-zinc-950 min-h-[92vh] flex items-center">
        {/* Background photo & rich visual gradients */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
            alt="Green agricultural farmlands during golden hour"
            className="absolute inset-0 w-full h-full object-cover opacity-65"
            width={1920}
            height={1080}
            unoptimized
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-zinc-950/85 to-zinc-950 hidden" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_20%,rgba(16,185,129,0.22),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/80 to-transparent" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-6 pt-[112px] lg:pt-[132px] pb-[88px] lg:pb-[128px] w-full">
          <div className="w-full max-w-[760px]">
            {/* Direct Commerce Live Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/15 text-[11px] tracking-[0.14em] font-bold text-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
              DIRECT AGRICULTURAL NETWORK
            </div>

            {/* Hero Title */}
            <h1 className="mt-6 text-[42px] sm:text-[52px] lg:text-[72px] font-[800] leading-[0.95] tracking-[-0.04em] text-white">
              Where India Grows,
              <br />
              <span className="text-emerald-300 italic font-[800]">Business Connects.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-[16px] lg:text-[18px] leading-[1.65] text-zinc-200/90 max-w-[580px] font-normal">
              FarmNex connects verified farmers, FPOs and bulk buyers on one trusted agricultural network — helping real produce find real buyers through direct connections.{" "}
              <span className="text-white font-medium">Fewer intermediaries. More direct connections.</span>
            </p>

            {/* Call to action buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => openAuth("farmer", "register")}
                className="group inline-flex items-center gap-2 h-[52px] px-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[15px] shadow-[0_12px_32px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.5)] hover:-translate-y-[1px] transition-all"
              >
                <span>Connect with FarmNex</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="inline-flex items-center gap-2.5 h-[52px] px-7 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium text-[15px] hover:bg-white/15 hover:border-white/30 transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900 ml-[1px]" />
                </span>
                <span>See How It Works</span>
              </button>
            </div>

            {/* Network tagline strip */}
            <div className="mt-7 flex flex-wrap items-center gap-2 text-[13px] text-emerald-200/90 font-medium">
              <span className="text-white font-semibold">Farmers</span>
              <span className="text-emerald-400">•</span>
              <span className="text-white font-semibold">FPOs</span>
              <span className="text-emerald-400">•</span>
              <span className="text-white font-semibold">Bulk Buyers</span>
              <span className="hidden sm:inline text-white/40 ml-1.5">—</span>
              <span className="text-zinc-300 ml-1">One network. Direct connections. Better opportunities.</span>
            </div>

            {/* Social Network Member Avatars Proof */}
            <div className="mt-10 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100",
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100",
                    "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=100",
                  ].map((src, idx) => (
                    <Image
                      key={idx}
                      src={src}
                      alt="Verified Member"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white/20 shadow-sm"
                      width={32}
                      height={32}
                      unoptimized
                      onError={handleImageError}
                    />
                  ))}
                </div>
                <span className="text-[13px] font-medium text-white/90">
                  <span className="text-white font-bold">4,200+</span> farmers ·{" "}
                  <span className="text-white font-bold">380+</span> FPO clusters ·{" "}
                  <span className="text-white font-bold">210+</span> commercial processors active
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11.5px] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live in 12 central mandi corridors
                </span>
                <span className="opacity-30">•</span>
                <span>ICICI Escrow Rails · NABL Lab Assays · GST Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* 3. FOR FARMERS & FPOS (PRODUCT POINTS + HARVEST VISUAL) */}
      {/* ------------------------------------------------------------------------- */}
      <div className="mx-auto max-w-[1280px] px-5 lg:px-6 py-12 lg:py-20 space-y-16 lg:space-y-24">
        <div
          id="for-farmers"
          className="scroll-mt-24 rounded-[28px] bg-white border border-zinc-200 shadow-[0_8px_40px_-24px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col lg:flex-row group"
        >
          <div className="relative lg:w-[52%] min-h-[360px] lg:min-h-[560px] overflow-hidden bg-zinc-100">
            <Image
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop"
              alt="Indian farmer in farm field holding harvested crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700"
              width={800}
              height={600}
              unoptimized
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              Direct Farm-Gate Procurement
            </span>
          </div>

          <div className="lg:w-[48%] p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-emerald-600 uppercase">
              FOR FARMERS &amp; FPOS
            </div>
            <h2 className="mt-3 text-[28px] sm:text-[32px] lg:text-[36px] font-[800] leading-[1.05] tracking-[-0.02em] text-zinc-900">
              List your produce.
              <br />
              Reach relevant buyers.
            </h2>
            <p className="mt-4 text-[14px] sm:text-[15px] leading-[1.6] text-zinc-500 max-w-[420px]">
              Stop depending on informal middlemen. Create assay-backed lots, join FPO aggregation clusters, and receive payout via digital bank escrow.
            </p>

            <div className="mt-8 space-y-5">
              {[
                ["List Lots with Lab Moisture Assays", "Attach certified moisture & foreign matter parameters to prevent arbitrary mill-gate dockage deductions."],
                ["Algorithmic Net Realization Ranking", "We calculate nearby buyer offers minus true transport freight—showing your exact pocket realization."],
                ["FPO Volume Consolidation", "Aggregate 32T+ community lots to unlock high-margin direct institutional contracts."],
                ["Unique Profile & Security", "Every cultivator gets an authenticated Profile ID and secure password for safe commercial trading."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-zinc-900">{title}</div>
                    <div className="text-[13px] text-zinc-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-center">
              <button
                onClick={() => openAuth("farmer", "register")}
                className="h-11 px-6 rounded-full bg-zinc-900 hover:bg-black text-white text-[14px] font-bold inline-flex items-center gap-2 transition"
              >
                <span>Join as a Farmer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[13px] text-zinc-500">
                Free to list · Escrow settled · No broker cut
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* 4. FOR FOOD PROCESSORS & BULK BUYERS */}
        {/* ------------------------------------------------------------------------- */}
        <div
          id="for-buyers"
          className="scroll-mt-24 rounded-[28px] bg-white border border-zinc-200 shadow-[0_8px_40px_-24px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col lg:flex-row-reverse group"
        >
          <div className="relative lg:w-[52%] min-h-[360px] lg:min-h-[560px] overflow-hidden bg-zinc-100">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
              alt="Industrial Grain Quality Testing Lab"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700"
              width={800}
              height={600}
              unoptimized
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-zinc-900 text-[11px] font-bold border border-white flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Industrial Grain Quality Testing
            </span>
          </div>

          <div className="lg:w-[48%] p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-blue-600 uppercase">
              FOR FOOD PROCESSORS &amp; BULK BUYERS
            </div>
            <h2 className="mt-3 text-[28px] sm:text-[32px] lg:text-[36px] font-[800] leading-[1.05] tracking-[-0.02em] text-zinc-900">
              Source verified lots.
              <br />
              At scale, with rails.
            </h2>
            <p className="mt-4 text-[14px] sm:text-[15px] leading-[1.6] text-zinc-500 max-w-[440px]">
              Specify moisture, foreign matter, and test weight. Discover verified FPO clusters ready to fulfill contracts and settle safely via weighbridge slips.
            </p>

            <div className="mt-8 space-y-5">
              {[
                ["Broadcast Procurement Tenders", "Post 100–500T seasonal requirements directly to high-density producer belts."],
                ["Define Exact Quality Tolerances", "Set lab moisture, FM, black spots, and splits cutoffs upfront."],
                ["Direct Producer Cluster Sourcing", "Source directly from Malwa, Nimar, Bundelkhand, and Vidarbha verified cooperatives."],
                ["Weighbridge & Escrow Rails", "Deposit into secure escrow; funds are released automatically on digital weighbridge receipt."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-zinc-900">{title}</div>
                    <div className="text-[13px] text-zinc-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-center">
              <button
                onClick={() => openAuth("buyer", "register")}
                className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold inline-flex items-center gap-2 transition shadow-md shadow-blue-500/20"
              >
                <Building2 className="w-4 h-4" />
                <span>Register as Commercial Buyer</span>
              </button>
              <span className="text-[13px] text-zinc-500">
                GST verified · Assay backed · Pan-India delivery
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* 5. HOW IT WORKS (POST -> MATCH -> SETTLE) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="how-it-works" className="scroll-mt-24 rounded-[28px] bg-zinc-900 text-white p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="max-w-[440px]">
              <div className="text-[11px] font-bold tracking-[0.18em] text-emerald-400 uppercase">
                HOW IT WORKS
              </div>
              <h2 className="mt-3 text-[28px] lg:text-[36px] font-[800] leading-[1.05]">
                Post. Match. <span className="text-emerald-300">Settle.</span>
              </h2>
              <p className="mt-3 text-[14px] leading-[1.6] text-zinc-400 font-normal">
                Engineered like a modern social network, not an outdated mandi paper register. Every lot has a digital assay; every buyer has verified settlement credentials.
              </p>
              <button
                onClick={() => openAuth("farmer", "register")}
                className="mt-6 h-11 px-6 rounded-full bg-white text-zinc-900 text-[14px] font-bold inline-flex items-center gap-2 hover:bg-zinc-100 transition"
              >
                <span>Create Account — Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 flex-1">
              {[
                {
                  step: "01",
                  title: "Create Lot",
                  desc: "Farmer or FPO posts crop, quantity, and moisture assay. Verified automatically with NABL lab partners.",
                },
                {
                  step: "02",
                  title: "Get Matched",
                  desc: "Our algorithm calculates net realization, factoring distance & freight against nearby processing mills.",
                },
                {
                  step: "03",
                  title: "Escrow Settle",
                  desc: "Weighbridge entry slip verifies physical lot weight; digital escrow releases instant payout safely.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-[18px] bg-white/[0.06] border border-white/10 p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] font-black tracking-widest text-emerald-400">
                      {item.step}
                    </div>
                    <div className="mt-3 text-[16px] font-bold text-white">
                      {item.title}
                    </div>
                    <div className="mt-2 text-[13px] leading-[1.55] text-zinc-400 font-normal">
                      {item.desc}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct digital rails
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 6. REAL SOCIAL FEED PREVIEW (HARVEST POSTS, FPO CLUSTERS & TENDERS) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="social-feed" className="scroll-mt-24 space-y-10">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold tracking-widest uppercase">
              SOCIAL FEED PREVIEW
            </div>
            <h2 className="mt-4 text-[28px] lg:text-[40px] font-[800] leading-[1.05] tracking-[-0.02em] text-zinc-900">
              The network where harvest meets demand
            </h2>
            <p className="mt-3 text-[15px] text-zinc-500 font-normal">
              Real posts from farm gates, cooperative aggregations, and industrial tenders — authentic commercial social networking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Post 1: Farmer Harvest Post */}
            <div className="rounded-[20px] bg-white border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between">
              <div>
                <div className="p-4 flex items-center gap-3 border-b border-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200"
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                    alt="Farmer Ramesh"
                    width={40}
                    height={40}
                    unoptimized
                    onError={handleImageError}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-zinc-900 truncate">
                      Ramesh Patel · <span className="text-emerald-600 font-semibold">Verified</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      Malwa Kisan Samriddhi FPO • 2h ago • Sanwer
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="relative w-full h-[220px] bg-zinc-100 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop"
                    alt="Soybean crop lot"
                    className="w-full h-full object-cover"
                    width={400}
                    height={300}
                    unoptimized
                    onError={handleImageError}
                  />
                </div>

                <div className="p-4">
                  <div className="flex gap-4 text-zinc-500 text-[12px] font-semibold pb-2 border-b border-zinc-100">
                    <span>❤️ 84 likes</span>
                    <span>💬 12 comments</span>
                    <span>↗ Share</span>
                  </div>
                  <p className="mt-2.5 text-[13.5px] leading-[1.55] text-zinc-700">
                    <span className="font-bold text-zinc-900">Just harvested JS-335 Soybean.</span> Lab moisture 10.4% — Grade A. 32T lot ready for dispatch from Sanwer yard. Looking for buyers paying net +400 over mandi spot. Escrow terms only.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-700">
                      320 Qtl
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      Grade A Assayed
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600">
                      ₹5,380 / Qtl
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => openAuth("buyer", "login")}
                  className="w-full h-9 rounded-full bg-zinc-900 hover:bg-black text-white text-[12.5px] font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Connect &amp; Negotiate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Post 2: FPO Cluster Aggregation Drop */}
            <div className="rounded-[20px] bg-white border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between">
              <div>
                <div className="p-4 flex items-center gap-3 border-b border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-black text-amber-800 text-[13px]">
                    MK
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-zinc-900 truncate">
                      Malwa Kisan FPO · <span className="text-amber-700 font-semibold">Cluster Drop</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      12 farmers • 4 villages • Live Pooling
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold tracking-wider">
                    POOLING
                  </span>
                </div>

                <div className="p-4">
                  <div className="rounded-[14px] bg-[#FFF8E1] border border-amber-200/80 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-amber-900">
                        Cluster Target: 500 Qtl
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-700">
                        84% Consolidated
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-amber-100 overflow-hidden">
                      <div className="h-full w-[84%] bg-amber-500 rounded-full" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-amber-200 text-center">
                        <span className="text-zinc-500 block">Ramesh P.</span>
                        <b className="text-zinc-900">80 Qtl</b>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-amber-200 text-center">
                        <span className="text-zinc-500 block">Sunita V.</span>
                        <b className="text-zinc-900">120 Qtl</b>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-amber-200 text-center">
                        <span className="text-zinc-500 block">Aarti D.</span>
                        <b className="text-zinc-900">60 Qtl</b>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3.5 text-[13.5px] leading-[1.55] text-zinc-700">
                    Consolidating Malwa belt lots for 400T industrial tender. Moisture &lt;11%, FM &lt;2%. Join before 6 PM — shared pooled transport available to Dewas mill.
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => openAuth("farmer", "login")}
                  className="w-full h-9 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[12.5px] font-bold transition"
                >
                  Join Supply Cluster →
                </button>
              </div>
            </div>

            {/* Post 3: Commercial Processor Tender */}
            <div className="rounded-[20px] bg-[#0F172A] border border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-white flex flex-col justify-between">
              <div>
                <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold truncate">
                      Agrocorp Processing · <span className="text-blue-400 font-semibold">Tender</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      Solvent Extraction Plant • Dewas
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wider">
                    TENDER
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="text-[16px] font-bold text-white">
                    Need 300T Soybean JS-335
                  </h4>

                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-zinc-400">Moisture Limit:</span>
                      <span className="font-bold text-white">&lt;11% NABL Assayed</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-zinc-400">Foreign Matter / Splits:</span>
                      <span className="font-bold text-white">&lt;2% FM / &lt;4% Splits</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-zinc-400">Delivery Yard:</span>
                      <span className="font-bold text-white">Dewas Industrial Area</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
                    <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                      BUDGET PRICE INDICATOR
                    </div>
                    <div className="text-[19px] font-black text-white">
                      ₹5,420 / Qtl{" "}
                      <span className="text-[12px] font-normal text-zinc-400">
                        ex-yard, escrow settled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => openAuth("farmer", "login")}
                  className="w-full h-10 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 text-[13px] font-bold transition"
                >
                  Apply with Your Crop Lot
                </button>
                <div className="mt-2 text-center text-[11px] text-zinc-400">
                  12 verified producers applied · 3 shortlisted
                </div>
              </div>
            </div>
          </div>

          {/* Social Network Callout */}
          <div className="rounded-[24px] bg-gradient-to-br from-emerald-600 to-emerald-500 p-[1px]">
            <div className="rounded-[23px] bg-gradient-to-br from-emerald-600 to-emerald-500 px-6 lg:px-10 py-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-white">
              <div>
                <h3 className="text-[22px] lg:text-[26px] font-bold leading-tight">
                  Join 20,000+ farmers &amp; processors building direct trade
                </h3>
                <p className="mt-2 text-[14px] text-emerald-50/90 max-w-[540px]">
                  From Indore to Kota and Vidarbha — view live lots, pool cluster tenders, and transact via protected bank escrow.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => openAuth("farmer", "register")}
                  className="h-11 px-6 rounded-full bg-white text-emerald-700 font-bold text-[14px] shadow-sm hover:bg-zinc-50 transition"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => openAuth("buyer", "login")}
                  className="h-11 px-6 rounded-full bg-emerald-950/30 border border-white/20 text-white font-semibold text-[14px] hover:bg-emerald-950/40 transition"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 7. LIVE MARKETPLACE TABBED PREVIEW */}
        {/* ------------------------------------------------------------------------- */}
        <section className="space-y-6 pt-4">
          <div className="rounded-[24px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                  REAL-TIME CATALOG
                </span>
                <h3 className="text-lg font-bold text-zinc-900">
                  Live Agricultural Marketplace
                </h3>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold">
                <button
                  onClick={() => setPreviewTab("produce")}
                  className={`px-3.5 py-1.5 rounded-full transition-colors ${
                    previewTab === "produce"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  🌾 Available Lots ({previewProduce.length})
                </button>
                <button
                  onClick={() => setPreviewTab("requirements")}
                  className={`px-3.5 py-1.5 rounded-full transition-colors ${
                    previewTab === "requirements"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  🏭 Mill Tenders ({previewRequirements.length})
                </button>
              </div>
            </div>

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

              <div className="pt-8 text-center border-t border-zinc-100 mt-8">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 h-11 px-8 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[13.5px] font-bold transition shadow-xs"
                >
                  <span>Explore All Live Listings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 8. FOOTER */}
        {/* ------------------------------------------------------------------------- */}
        <footer className="pt-10 border-t border-zinc-200 flex flex-col lg:flex-row justify-between gap-4 text-[12px] text-zinc-500 pb-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span>FarmNex V3 • The Pulse of Agri Commerce • © 2026</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <span>Escrow Partner: ICICI Bank</span>
            <span>•</span>
            <span>Assay Standard: NABL Accredited Labs</span>
            <span>•</span>
            <span>State Corridors: MP &amp; Rajasthan</span>
          </div>
        </footer>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 9. FLOATING TOAST NOTIFICATION */}
      {/* ------------------------------------------------------------------------- */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 h-11 rounded-full bg-zinc-900 text-white text-[13px] font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 10. UNIFIED SECURE AUTHENTICATION MODAL (PROFILE ID + PASSWORD) */}
      {/* ------------------------------------------------------------------------- */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAuthModalOpen(false)}
          />

          <div className="relative w-full sm:max-w-[480px] max-h-[92vh] flex flex-col bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                  FARMNEX AUTHENTICATION
                </span>
              </div>
              <h3 className="text-[22px] font-black tracking-tight text-zinc-900">
                {authMode === "login" ? "Sign In to Your Account" : "Create Real-World Agri Account"}
              </h3>
              <p className="text-[12.5px] text-zinc-500 mt-0.5">
                {authMode === "login"
                  ? "Access your farm lots, contracts, and negotiation channels with your Profile ID."
                  : "Fill your verified details, pick a unique Profile ID, and set your secure password."}
              </p>

              {/* Mode Switch Tabs (Log In vs Register) */}
              <div className="mt-4 flex p-1 rounded-full bg-zinc-100 border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    resetFeedback();
                  }}
                  className={`flex-1 h-8 rounded-full text-[12.5px] font-bold transition ${
                    authMode === "login"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Log In (Existing User)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    resetFeedback();
                  }}
                  className={`flex-1 h-8 rounded-full text-[12.5px] font-bold transition ${
                    authMode === "register"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Register First Time
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable for full registration form) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 pt-4 space-y-4">
              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ---------------- TAB 1: LOGIN FORM ---------------- */}
              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                      Unique Profile ID / Mobile / Email *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[14px]">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. ramesh.patel or 9876543210"
                        className="w-full h-11 pl-8 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Login requires your unique Profile ID and password.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
                        Account Password *
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    className="w-full h-11 rounded-full bg-zinc-900 hover:bg-black text-white text-[14px] font-bold shadow-md transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? "Verifying Credentials..." : "Sign In with Profile ID"}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 text-center text-[12px] text-zinc-500 border-t border-zinc-100">
                    <span>Don&apos;t have an account yet? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        resetFeedback();
                      }}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      Register here →
                    </button>
                  </div>
                </form>
              ) : (
                /* ---------------- TAB 2: REGISTRATION FORM ---------------- */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Role Selection */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                      Select Your Role in Agriculture *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-[12px] font-bold">
                      {[
                        { role: "farmer", label: "Farmer (Kisan)", icon: Sprout },
                        { role: "fpo", label: "FPO Collective", icon: UsersRound },
                        { role: "buyer", label: "Processor / Mill", icon: Building2 },
                        { role: "consumer", label: "Consumer / Bulk", icon: ShoppingBag },
                      ].map((item) => {
                        const Icon = item.icon;
                        const active = authRole === item.role;
                        return (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => setAuthRole(item.role as any)}
                            className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition ${
                              active
                                ? "bg-white text-zinc-900 shadow-sm font-black"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Unique Profile ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          if (!regProfileId) {
                            setRegProfileId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "."));
                          }
                        }}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                        Unique Profile ID *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[13px]">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          value={regProfileId}
                          onChange={(e) => setRegProfileId(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                          placeholder="ramesh.patel"
                          className="w-full h-10 pl-7 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full h-10 px-3.5 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Location & Mandi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                        Location / Mandi Belt *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="e.g. Sanwer, Indore, MP"
                        className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {authRole === "farmer" ? (
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                          Farm Size (Acres)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={regFarmSize}
                          onChange={(e) => setRegFarmSize(e.target.value)}
                          placeholder="12"
                          className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ) : authRole === "buyer" ? (
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                          Monthly Capacity
                        </label>
                        <input
                          type="text"
                          value={regCapacity}
                          onChange={(e) => setRegCapacity(e.target.value)}
                          placeholder="e.g. 5,000 Qtl/month"
                          className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="contact@email.com"
                          className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary Crops / Commodities */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                      Primary Crops / Commodities
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Soybean", "Wheat", "Cotton", "Gram (Chana)", "Mustard", "Garlic", "Maize", "Onion"].map((crop) => {
                        const active = regCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setRegCrops(regCrops.filter((c) => c !== crop));
                              } else {
                                setRegCrops([...regCrops, crop]);
                              }
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded-md font-bold transition border ${
                              active
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            {active ? "✓ " : "+ "}{crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profile Headline */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 block mb-1">
                      Headline / Specialization
                    </label>
                    <input
                      type="text"
                      value={regHeadline}
                      onChange={(e) => setRegHeadline(e.target.value)}
                      placeholder="e.g. Certified Soybean & Sharbati Wheat Producer"
                      className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[13.5px] text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-bold shadow-md transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? "Registering Account..." : "Create Account & Sign In"}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 text-center text-[11.5px] text-zinc-500 border-t border-zinc-100">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        resetFeedback();
                      }}
                      className="font-bold text-zinc-900 hover:underline"
                    >
                      Sign In here →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Trust Bar */}
            <div className="px-6 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Bank Escrow · Real-World Agri Network · Encrypted Passwords</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
