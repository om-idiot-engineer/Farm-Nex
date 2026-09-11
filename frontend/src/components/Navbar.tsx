"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleNavigation, getRolePrimaryAction } from "@/lib/navigation";
import { Menu, X, Leaf, Bell, Search, Sprout, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import { DEMO_MODE } from "@/lib/api";

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // We are going to just use a fixed role if user is missing, or rely on actual auth.
  // Actually, since this is FarmNex, the user handles role switching inside settings or is fixed.
  // For the sake of UI, we use the user context.

  const isLandingPage = pathname === "/";
  const isFarmer = user?.role === "farmer";
  const themeClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/70">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-[64px] flex items-center justify-between gap-4">
        {/* LEFT SIDE: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            className="lg:hidden p-2 rounded-xl bg-zinc-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${themeClass} flex items-center justify-center text-white shadow-lg`}>
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[19px] tracking-tight hidden sm:block">FarmNex</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-white -mt-3 hidden sm:block">V3</span>
            {DEMO_MODE && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white -mt-3 hidden sm:block">DEMO MODE</span>
            )}
          </Link>

          {/* Desktop Role Toggle Switch (mockup style) */}
          <div className="hidden md:flex items-center p-1 rounded-full bg-zinc-100 border border-zinc-200 ml-4">
            <button
              onClick={() => {}}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                isFarmer ? "bg-white shadow border border-zinc-200 text-emerald-700" : "text-zinc-500"
              }`}
            >
              <Sprout className="w-4 h-4" /> Farmer
            </button>
            <button
              onClick={() => {}}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                !isFarmer ? "bg-white shadow border border-zinc-200 text-blue-700" : "text-zinc-500"
              }`}
            >
              <Store className="w-4 h-4" /> Buyer
            </button>
          </div>
        </div>

        {/* MIDDLE: Search */}
        {user && (
          <div className="flex-1 max-w-[420px] hidden lg:flex">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                placeholder="Search crops, farmers, posts..."
                className="w-full h-9 pl-9 pr-3 rounded-full bg-zinc-100 border border-zinc-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
          </div>
        )}

        {/* RIGHT SIDE: Notifications, Install, Profile */}
        <div className="flex items-center gap-1.5 lg:gap-2">
          {user ? (
            <>
              <button className={`hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px] font-semibold text-white bg-gradient-to-r ${themeClass} shadow hover:scale-[1.02] transition`}>
                Install App
              </button>

              <button className="relative w-9 h-9 rounded-full bg-zinc-100 border flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <Bell className="w-4 h-4 text-zinc-700" />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 border-2 border-white shadow flex items-center justify-center text-white font-bold text-[12px]">
                {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
            </>
          ) : (
            <>
              <Link href="/marketplace" className="text-sm font-semibold hover:text-primary mr-4 hidden sm:block">Marketplace</Link>
              <Button asChild variant="outline" className="h-9 px-4 rounded-full text-xs font-bold">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileOpen && user && (
        <div className="lg:hidden border-t border-zinc-200 bg-white p-4 space-y-4 animate-in slide-in-from-top-2 shadow-xl">
          <div className="mb-2">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                placeholder="Search..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-zinc-100 border border-zinc-200 text-[14px] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-2">
              Menu
            </p>
            {getRoleNavigation(user.role).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <Icon className="w-5 h-5 text-zinc-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
