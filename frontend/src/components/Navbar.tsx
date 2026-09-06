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
import { getRoleHome, getRoleNavigation, getMobileNavigation, getRolePrimaryAction, type NavLinkItem } from "@/lib/navigation";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenAuth = (role: "farmer" | "buyer" = "farmer", mode: "login" | "register" = "login") => {
    if (typeof window !== "undefined") {
      if (pathname === "/") {
        window.dispatchEvent(new CustomEvent("open-farmnex-auth", { detail: { role, mode } }));
      } else {
        router.push(`/?auth=${role}&mode=${mode}`);
      }
    }
  };

  const roleNav = user ? getRoleNavigation(user.role) : [];
  const mobileNav = user ? getMobileNavigation(user.role) : [];
  const primaryAction = user ? getRolePrimaryAction(user.role) : null;
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
    return pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b bg-card/95 backdrop-blur transition-all duration-200 ${
          scrolled ? "border-border shadow-sm" : "border-border/60"
        }`}
      >
        {/* TOP BAR */}
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-200 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={user ? getRoleHome(user.role) : "/"}
              className="flex items-center gap-2.5 group"
              aria-label="FarmNex Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
                <Sprout className="h-5 w-5" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-foreground">FarmNex</span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Agri-OS</span>
              </div>
            </Link>

            {user && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-primary/25 bg-primary/10 text-primary">
                {getRoleLabel(user.role)}
              </span>
            )}
          </div>

          {/* Center Navigation: Global Search when logged in, or Public Links when visitor */}
          {user ? (
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <GlobalSearch />
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-bold text-muted-foreground" aria-label="Public Navigation">
              <Link
                href="/#how-it-works"
                className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#for-farmers"
                className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                For Farmers
              </Link>
              <Link
                href="/#for-buyers"
                className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                For Buyers
              </Link>
              <Link
                href="/marketplace"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/marketplace" ? "text-primary font-black bg-primary/5" : "hover:text-foreground hover:bg-muted/40"
                }`}
              >
                Marketplace
              </Link>
              <Link
                href="/#trust"
                className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                Trust &amp; Escrow
              </Link>
            </nav>
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
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted/70 transition-colors"
                  title="Switch testing persona"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="capitalize">{user.role}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {personaOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPersonaOpen(false)} />
                    <div className="absolute right-0 mt-2 z-40 w-52 rounded-lg border border-border bg-card shadow-xl py-1.5 text-xs animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                        Switch Persona
                      </div>
                      {(["farmer", "fpo", "buyer", "consumer", "admin"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSwitchRole(r)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${
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
                    className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
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
                            <span>Messages</span>
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
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="font-bold text-xs hover:bg-muted/50 text-foreground"
                  onClick={() => handleOpenAuth("farmer", "login")}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="font-bold text-xs shadow-xs"
                  onClick={() => handleOpenAuth("farmer", "login")}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu trigger (for both authenticated and public visitors) */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* DESKTOP SECONDARY WORKSPACE NAVIGATION BAR */}
        {user && (
          <div className="hidden lg:block border-t border-border bg-card/60 backdrop-blur">
            <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1 overflow-x-auto">
                {roleNav.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Primary Role CTA + Global Portals */}
              <div className="flex items-center gap-3 shrink-0 pl-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-r border-border pr-3">
                  <Link
                    href="/marketplace"
                    className={`px-2 py-1 rounded hover:text-foreground ${
                      pathname === "/marketplace" ? "font-bold text-primary" : ""
                    }`}
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/community"
                    className={`px-2 py-1 rounded hover:text-foreground ${
                      pathname === "/community" || pathname === "/network" ? "font-bold text-primary" : ""
                    }`}
                  >
                    Community
                  </Link>
                </div>

                {primaryAction && (
                  <Button asChild size="sm" className="h-8 font-bold text-xs shadow-xs">
                    <Link href={primaryAction.href}>
                      {primaryAction.label}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MOBILE SLIDE-OVER DRAWER (User Authenticated) */}
        {mobileOpen && user && (
          <div className="lg:hidden border-t border-border bg-card p-4 space-y-4 animate-in slide-in-from-top-2">
            <div className="mb-2">
              <GlobalSearch />
            </div>

            {primaryAction && (
              <Button asChild className="w-full font-bold shadow-xs">
                <Link href={primaryAction.href} onClick={() => setMobileOpen(false)}>
                  {primaryAction.label}
                </Link>
              </Button>
            )}

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
                href="/community"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted/40"
              >
                <span className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-primary" />
                  <span>Community Network</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* MOBILE SLIDE-OVER DRAWER (Public Visitor) */}
        {mobileOpen && !user && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 shadow-xl">
            <div className="space-y-1">
              <Link
                href="/#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <span>How It Works</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/#for-farmers"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <span>For Farmers &amp; FPOs</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/#for-buyers"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <span>For Food Processors &amp; Buyers</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span>Live Marketplace</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#trust"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <span>Trust, Assays &amp; Escrow</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <Button
                type="button"
                className="w-full font-bold shadow-xs justify-center"
                onClick={() => {
                  setMobileOpen(false);
                  handleOpenAuth("farmer", "login");
                }}
              >
                🌾 Get Started as Farmer
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full font-bold justify-center"
                onClick={() => {
                  setMobileOpen(false);
                  handleOpenAuth("buyer", "login");
                }}
              >
                🏭 Bulk Buyer / Processor Login
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Tailored per role) */}
      {user && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur px-2 py-1.5 flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md text-[10px] font-bold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
