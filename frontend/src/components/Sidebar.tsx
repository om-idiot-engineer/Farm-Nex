"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleNavigation, getRolePrimaryAction } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { type NavLinkItem } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  const navItems = getRoleNavigation(user.role);
  const primaryAction = getRolePrimaryAction(user.role);

  const isLinkActive = (item: NavLinkItem) => {
    if (!pathname) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
  };

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 border-r border-border bg-card/60 backdrop-blur-xs h-[calc(100vh-3.5rem)] sticky top-14 py-5 px-3.5 shrink-0 overflow-y-auto">
      <div className="space-y-5">
        {primaryAction && (
          <Button asChild className="w-full font-bold shadow-xs justify-center text-xs h-10">
            <Link href={primaryAction.href} className="flex items-center gap-2">
              <primaryAction.icon className="h-4 w-4 shrink-0" />
              <span>{primaryAction.label}</span>
            </Link>
          </Button>
        )}

        <nav className="space-y-1" aria-label="Role Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active 
                    ? "bg-primary text-primary-foreground font-bold shadow-xs" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Trust & Network Guarantee Card */}
      <div className="pt-4 mt-4 border-t border-border/70">
        <div className="rounded-xl p-3 bg-muted/30 border border-border/60 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FarmNex Trade Guarantee</span>
          </div>
          <p className="text-muted-foreground leading-tight text-[10px]">
            100% Escrow settlements & NABL assay grade verification enabled.
          </p>
        </div>
      </div>
    </aside>
  );
}
