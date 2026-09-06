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
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-[calc(100vh-3.5rem)] sticky top-14 py-6 px-4 shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {primaryAction && (
          <Button asChild className="w-full font-bold shadow-xs">
            <Link href={primaryAction.href}>
              {primaryAction.label}
            </Link>
          </Button>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
