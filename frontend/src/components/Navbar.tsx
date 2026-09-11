"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";
import { getRoleNavigation, getRolePrimaryAction } from "@/lib/navigation";
import { Menu, X, Leaf, Bell, Search, Sprout, Store, ArrowRight, CheckCircle2, Check, Sparkles, Shield, User, Pencil, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import EditProfileModal from "@/components/EditProfileModal";
import { getProfile } from "@/lib/services/domain";
import type { DemoProfile } from "@/lib/data/demo";
import { DEMO_MODE } from "@/lib/api";

export default function Navbar() {
  const { user, switchDemoRole, logout } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<DemoProfile | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  // Secret dev key sequence: type "dev" (d → e → v) to open developer page
  const [devKeySeq, setDevKeySeq] = useState("");

  const fetchNotifs = React.useCallback(async () => {
    try {
      const { getNotifications } = await import("@/lib/services/domain");
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchNotifs();
    }
  }, [user, fetchNotifs, pathname]);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (notifOpen || userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen, userDropdownOpen]);

  const openEditProfile = () => {
    setUserDropdownOpen(false);
    if (user) {
      const p = getProfile(user.id).data;
      setActiveProfile(p);
      setEditProfileOpen(true);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Secret dev shortcut: type "dev" quickly to navigate to /developer
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const next = (devKeySeq + e.key.toLowerCase()).slice(-3);
      setDevKeySeq(next);
      if (next === "dev") {
        router.push("/developer");
        setDevKeySeq("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [devKeySeq, router]);

  const handleMarkAllRead = async () => {
    const { markNotificationsRead } = await import("@/lib/services/domain");
    await markNotificationsRead();
    setNotifications((curr) => curr.map((n) => ({ ...n, unread: false })));
  };

  const handleItemClick = async (notif: any) => {
    if (notif.unread) {
      const { markNotificationAsRead } = await import("@/lib/services/domain");
      await markNotificationAsRead(notif.id);
      setNotifications((curr) =>
        curr.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
      );
    }
    setNotifOpen(false);
  };

  // We are going to just use a fixed role if user is missing, or rely on actual auth.
  // Actually, since this is FarmNex, the user handles role switching inside settings or is fixed.
  // For the sake of UI, we use the user context.

  const isLandingPage = pathname === "/";
  const isFarmer = user?.role === "farmer";
  const themeClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";

  // Landing page has its own dedicated transparent/scrolled navbar matching the exact artifact
  if (isLandingPage) {
    return null;
  }

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

          {/* Desktop Role Toggle Switch */}
          <div className="hidden md:flex items-center p-1 rounded-full bg-zinc-100 border border-zinc-200 ml-4">
            <button
              onClick={() => {
                switchDemoRole("farmer");
                router.push("/farmer");
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                isFarmer ? "bg-white shadow border border-zinc-200 text-emerald-700" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Sprout className="w-4 h-4" /> Farmer
            </button>
            <button
              onClick={() => {
                switchDemoRole("buyer");
                router.push("/buyer");
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                !isFarmer ? "bg-white shadow border border-zinc-200 text-blue-700" : "text-zinc-500 hover:text-zinc-800"
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

              {/* Notification Bell with Dropdown Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label={`Notifications (${unreadCount} unread)`}
                  className="relative w-9 h-9 rounded-full bg-zinc-100 border flex items-center justify-center hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <Bell className="w-4 h-4 text-zinc-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
                    {/* Header */}
                    <div className="p-3.5 px-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[13px] text-zinc-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <Link
                            key={n.id}
                            href={n.href || "/notifications"}
                            onClick={() => handleItemClick(n)}
                            className={`block p-3.5 hover:bg-zinc-50 transition-colors ${
                              n.unread ? "bg-emerald-50/30" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {n.unread && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-[12.5px] leading-snug truncate ${n.unread ? "font-bold text-zinc-900" : "font-medium text-zinc-700"}`}>
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                                  {n.description}
                                </p>
                                <span className="text-[10px] text-zinc-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 px-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-[12px]">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 w-full justify-center py-1"
                      >
                        View all alerts <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title={`Account: ${user.name}`}
                  className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-white shadow flex items-center justify-center text-white font-bold text-[12px] hover:scale-105 transition-transform"
                >
                  {user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name ? user.name.substring(0, 2).toUpperCase() : "U"
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 p-1.5 space-y-1">
                    <div className="px-3 py-2 border-b border-zinc-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          user.name ? user.name.substring(0, 2).toUpperCase() : "U"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-zinc-900 truncate">{user.name}</p>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider capitalize truncate">
                          {user.role} · {user.farmer_profile?.location?.split(",")[0] || user.buyer_profile?.location?.split(",")[0] || "MP, India"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/profile/${user.id || "f0000000-0000-0000-0000-000000000001"}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition"
                    >
                      <User className="w-4 h-4 text-zinc-500" />
                      <span>View Public Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={openEditProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition text-left"
                    >
                      <Pencil className="w-4 h-4 text-emerald-600" />
                      <span>Edit My Profile</span>
                    </button>

                    <div className="pt-1 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/marketplace" className="text-sm font-semibold hover:text-primary mr-2 hidden sm:block">Marketplace</Link>
              <Button asChild variant="outline" className="h-9 px-4 rounded-full text-xs font-bold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="h-9 px-4 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/login?mode=register">Join FarmNex</Link>
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
              Role Mode
            </p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole("farmer");
                  setMobileOpen(false);
                  router.push("/farmer");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isFarmer ? "bg-white shadow text-emerald-700" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Sprout className="w-3.5 h-3.5" /> Farmer
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole("buyer");
                  setMobileOpen(false);
                  router.push("/buyer");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !isFarmer ? "bg-white shadow text-blue-700" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Buyer
              </button>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-2">
              Menu
            </p>
            <Link
              href="/notifications"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-zinc-500" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </Link>
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

      {/* Edit Profile Modal */}
      {activeProfile && (
        <EditProfileModal
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          profile={activeProfile}
          onProfileUpdated={(updated) => setActiveProfile(updated)}
        />
      )}
    </header>
  );
}
