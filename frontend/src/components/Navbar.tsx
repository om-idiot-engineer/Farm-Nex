"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingBasket,
  Sprout,
  Store,
  TrendingUp,
  UsersRound,
  X,
  User,
  Shield,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DEMO_MODE } from "@/lib/api";
import { useUser, getRoleLabel } from "@/lib/auth/UserContext";
import { getRoleHome, getRoleNavigation, type NavLinkItem } from "@/lib/navigation";
import { getNotifications, markNotificationsRead } from "@/lib/services/domain";
import type { AppNotification } from "@/lib/data/demo";
import GlobalSearch from "@/components/GlobalSearch";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, switchDemoRole } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  const roleNav = user ? getRoleNavigation(user.role) : [];
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    getNotifications().then((res) => setNotifications(res.data));
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setPersonaOpen(false);
    setNotifPopoverOpen(false);
  }, [pathname]);

  const handleOpenNotifications = async () => {
    setNotifPopoverOpen(!notifPopoverOpen);
    if (!notifPopoverOpen && unreadCount > 0) {
      await markNotificationsRead();
      setNotifications((curr) => curr.map((n) => ({ ...n, unread: false })));
    }
  };

  const handleSwitchRole = (role: "farmer" | "fpo" | "buyer" | "consumer" | "admin") => {
    switchDemoRole(role);
    setPersonaOpen(false);
    router.push(getRoleHome(role));
  };

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  const isLinkActive = (item: NavLinkItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        {/* TOP BAR */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={user ? getRoleHome(user.role) : "/"}
              className="flex items-center gap-2 group"
              aria-label="FarmNex Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="text-xl font-black tracking-tight text-foreground">FarmNex</span>
            </Link>

            {user && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">
                {getRoleLabel(user.role)}
              </span>
            )}
          </div>

          {/* Center: Global Search */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <GlobalSearch />
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />

            {/* Persona Switcher (Testing dropdown in demo mode) */}
            {DEMO_MODE && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPersonaOpen(!personaOpen)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  title="Switch testing persona"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="capitalize">{user.role}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {personaOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPersonaOpen(false)} />
                    <div className="absolute right-0 mt-2 z-40 w-48 rounded-md border border-border bg-card shadow-xl py-1 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                        Switch Persona
                      </div>
                      {(["farmer", "fpo", "buyer", "consumer", "admin"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSwitchRole(r)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted/40 transition-colors ${
                            user.role === r ? "font-bold text-primary bg-primary/5" : "text-foreground"
                          }`}
                        >
                          <span className="capitalize">{r}</span>
                          {user.role === r && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleOpenNotifications}
                    className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {notifPopoverOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setNotifPopoverOpen(false)} />
                      <div className="absolute right-0 mt-2 z-40 w-80 sm:w-96 rounded-lg border border-border bg-card shadow-xl p-3 text-xs animate-in fade-in-50 zoom-in-95">
                        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2">
                          <span className="font-bold text-foreground">Notifications</span>
                          <Link
                            href="/notifications"
                            className="text-[11px] font-semibold text-primary hover:underline"
                            onClick={() => setNotifPopoverOpen(false)}
                          >
                            View all
                          </Link>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {notifications.length ? (
                            notifications.map((n) => (
                              <Link
                                key={n.id}
                                href={n.href}
                                onClick={() => setNotifPopoverOpen(false)}
                                className={`block p-2.5 rounded-md border transition-colors ${
                                  n.unread
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-card border-border hover:bg-muted/30"
                                }`}
                              >
                                <p className="font-bold text-foreground">{n.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{n.description}</p>
                              </Link>
                            ))
                          ) : (
                            <p className="text-muted-foreground p-3 text-center">No notifications.</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Avatar / Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 z-40 w-56 rounded-lg border border-border bg-card shadow-xl p-2 text-xs">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="font-bold text-foreground truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{user.role} workspace</p>
                        </div>
                        <div className="py-1 space-y-0.5">
                          <Link
                            href={`/profile/${user.id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/40 font-medium"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Public Profile</span>
                          </Link>
                          <Link
                            href="/notifications"
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/40 font-medium"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>Notifications</span>
                          </Link>
                          <Link
                            href="/messages"
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/40 font-medium"
                            onClick={() => setProfileOpen(false)}
                          >
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>Deal Messages</span>
                          </Link>
                        </div>
                        <div className="pt-1 border-t border-border">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Button asChild size="sm" className="font-bold">
                <Link href="/">Sign in</Link>
              </Button>
            )}

            {/* Mobile Menu trigger */}
            {user && (
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP SECONDARY WORKSPACE NAVIGATION BAR */}
        {user && (
          <div className="hidden lg:block border-t border-border bg-muted/20">
            <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8 overflow-x-auto">
              {roleNav.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Global direct shortcuts */}
              <div className="ml-auto flex items-center gap-2 pl-4 border-l border-border text-xs text-muted-foreground">
                <Link
                  href="/marketplace"
                  className={`px-2 py-1 rounded hover:text-foreground ${
                    pathname === "/marketplace" ? "font-bold text-primary" : ""
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/network"
                  className={`px-2 py-1 rounded hover:text-foreground ${
                    pathname === "/network" ? "font-bold text-primary" : ""
                  }`}
                >
                  Network Feed
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE SLIDE-OVER DRAWER */}
        {mobileOpen && user && (
          <div className="lg:hidden border-t border-border bg-card p-4 space-y-4 animate-in slide-in-from-top-2">
            <div className="mb-2">
              <GlobalSearch />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2">
                {getRoleLabel(user.role)} Workspace
              </p>
              {roleNav.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      active ? "bg-primary text-primary-foreground font-bold" : "text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2">
                All Portals
              </p>
              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted/40"
              >
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span>Marketplace</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/network"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted/40"
              >
                <span className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-primary" />
                  <span>Network Feed</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {user && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur px-2 py-1.5 flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          <Link
            href={getRoleHome(user.role)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-bold ${
              pathname === getRoleHome(user.role) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            href="/network"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-bold ${
              pathname.startsWith("/network") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <UsersRound className="h-4 w-4" />
            <span>Network</span>
          </Link>

          <Link
            href="/marketplace"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-bold ${
              pathname.startsWith("/marketplace") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Market</span>
          </Link>

          <Link
            href="/messages"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-bold relative ${
              pathname.startsWith("/messages") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </Link>

          <Link
            href="/orders"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-bold ${
              pathname.startsWith("/orders") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShoppingBasket className="h-4 w-4" />
            <span>Deals</span>
          </Link>
        </nav>
      )}
    </>
  );
}
