"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, ShieldCheck, Scale, ArrowRight, ExternalLink, MapPin } from "lucide-react";

export default function AppFooter() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <footer className="border-t border-border bg-card/90 text-foreground pt-14 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-border/80">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Sprout className="h-5 w-5" />
                </span>
                <span className="text-xl font-black tracking-tight text-foreground">FarmNex</span>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  Agri-OS
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Direct agricultural trade platform connecting farmers and FPOs with food processors and bulk buyers. Eliminating unnecessary intermediaries with transparent net realization and bank escrow.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Indore, Dewas, Ujjain &amp; Malwa Agricultural Hubs, MP</span>
              </div>
            </div>

            {/* Platform links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Platform</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/marketplace" className="hover:text-primary transition-colors">
                    Live Marketplace
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-primary transition-colors">
                    How FarmNex Works
                  </a>
                </li>
                <li>
                  <a href="#problem-solution" className="hover:text-primary transition-colors">
                    Direct Trade Engine
                  </a>
                </li>
                <li>
                  <Link href="/intelligence" className="hover:text-primary transition-colors">
                    Mandi Benchmark Rates
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-primary transition-colors">
                    Agricultural Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Participants */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Participants</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="#for-farmers" className="hover:text-primary transition-colors">
                    For Farmers &amp; FPOs
                  </a>
                </li>
                <li>
                  <a href="#for-buyers" className="hover:text-primary transition-colors">
                    For Food Processors &amp; Mills
                  </a>
                </li>
                <li>
                  <Link href="/consumer/shop" className="hover:text-primary transition-colors">
                    Direct Consumer Store
                  </Link>
                </li>
                <li>
                  <a href="#trust" className="hover:text-primary transition-colors">
                    NABL Assay Verification
                  </a>
                </li>
                <li>
                  <a href="#trust" className="hover:text-primary transition-colors">
                    Bank Escrow Settlement
                  </a>
                </li>
              </ul>
            </div>

            {/* Key Crops & Regions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Active Commodities</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>Yellow Soybean (Grade A &amp; B)</li>
                <li>Sharbati &amp; Lokwan Wheat</li>
                <li>Long-Staple Cotton</li>
                <li>Kabuli &amp; Desi Chana (Gram)</li>
                <li>Mustard &amp; Oilseeds</li>
              </ul>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} FarmNex Technologies. Smart India Hackathon (SIH) Project.</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-foreground font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Verified Farm-Gate Net Realization
              </span>
              <span>•</span>
              <span>Zero Middlemen Markups</span>
              <span>•</span>
              <span>Protected Trade Escrow</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Subpages / Dashboard compact footer
  return (
    <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
        <p>FarmNex © {new Date().getFullYear()} · Agri-OS Platform</p>
        <div className="flex items-center gap-3 font-medium text-primary">
          <span>Direct farmer realization</span>
          <span className="hidden sm:inline">•</span>
          <span>Transparent logistics</span>
          <span className="hidden sm:inline">•</span>
          <span>Market data context</span>
        </div>
      </div>
    </footer>
  );
}
