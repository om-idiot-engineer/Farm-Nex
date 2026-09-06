import type { UserProfile } from "@/lib/api";
import {
  LayoutDashboard,
  Sprout,
  Store,
  UsersRound,
  TrendingUp,
  ShoppingBasket,
  Truck,
  Layers3,
  Building2,
  FileCheck2,
  ShieldCheck,
  Scale,
  BarChart3,
  Heart,
  MessageSquare,
  Search,
  Plus,
  Compass,
  FileText,
  Handshake,
} from "lucide-react";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

export interface RolePrimaryAction {
  label: string;
  href: string;
  icon: any;
}

export function getRoleHome(role?: UserProfile["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "buyer") return "/buyer";
  if (role === "fpo") return "/fpo";
  if (role === "consumer") return "/consumer";
  if (role === "expert") return "/network";
  return "/farmer";
}

export function getRolePrimaryAction(role?: UserProfile["role"]): RolePrimaryAction {
  if (role === "farmer") {
    return { label: "+ List Produce", href: "/farmer/produce/new", icon: Plus };
  }
  if (role === "buyer") {
    return { label: "+ Publish RFQ", href: "/buyer/procurement", icon: Plus };
  }
  if (role === "fpo") {
    return { label: "+ Pool Supply", href: "/fpo/supply", icon: Plus };
  }
  if (role === "consumer") {
    return { label: "Shop Fresh", href: "/consumer/shop", icon: ShoppingBasket };
  }
  if (role === "admin") {
    return { label: "Review Ops", href: "/admin/disputes", icon: ShieldCheck };
  }
  return { label: "Explore Market", href: "/marketplace", icon: Store };
}

export function getRoleNavigation(role?: UserProfile["role"]): NavLinkItem[] {
  if (!role) return [];

  const baseNav: NavLinkItem[] = [
    { href: getRoleHome(role), label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/network", label: "Network", icon: UsersRound },
    { href: "/marketplace", label: "Marketplace", icon: Store },
  ];

  if (role === "buyer") {
    baseNav.push({ href: "/buyer/procurement", label: "Procurement", icon: FileText });
  } else {
    baseNav.push({ href: "/orders", label: "Orders", icon: ShoppingBasket });
  }

  baseNav.push({ href: "/messages", label: "Messages", icon: MessageSquare });

  return baseNav;
}

export function getMobileNavigation(role?: UserProfile["role"]): NavLinkItem[] {
  if (!role) return [];

  const baseNav: NavLinkItem[] = [
    { href: getRoleHome(role), label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/network", label: "Network", icon: UsersRound },
    { href: "/marketplace", label: "Market", icon: Store },
  ];

  if (role === "buyer") {
    baseNav.push({ href: "/buyer/procurement", label: "Procure", icon: FileText });
  } else {
    baseNav.push({ href: "/orders", label: "Orders", icon: ShoppingBasket });
  }

  baseNav.push({ href: "/messages", label: "Messages", icon: MessageSquare });

  return baseNav;
}
