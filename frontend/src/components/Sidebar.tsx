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
    <aside className="hidden lg:flex flex-col justify-between w-[240px] shrink-0 sticky top-[64px] h-[calc(100vh-64px)] p-4 border-r border-black/[0.06] bg-white transition-all duration-300">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        {primaryAction && (
          <Button asChild className="w-full font-bold shadow-md justify-center text-xs h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
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
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-zinc-900 text-white shadow-md"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-black/[0.06] mt-4">
        <div className="px-2 text-[11px] text-zinc-400 leading-relaxed">
          &copy; 2026 FarmNex<br/>
          PWA Ready • Bhopal, MP
        </div>
      </div>
    </aside>
  );
}
