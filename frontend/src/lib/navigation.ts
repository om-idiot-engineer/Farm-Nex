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
  Bell,
  Search,
} from "lucide-react";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

export function getRoleHome(role: UserProfile["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "buyer") return "/buyer";
  if (role === "fpo") return "/fpo";
  if (role === "consumer") return "/consumer";
  if (role === "expert") return "/network";
  return "/farmer";
}

export function getRoleNavigation(role: UserProfile["role"]): NavLinkItem[] {
  if (role === "farmer") {
    return [
      { href: "/farmer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/farmer/produce", label: "My Produce", icon: Sprout },
      { href: "/farmer/buyers", label: "Find Buyers", icon: TrendingUp },
      { href: "/orders", label: "Deals", icon: ShoppingBasket },
      { href: "/farmer/market", label: "Market", icon: BarChart3 },
      { href: "/network", label: "Network", icon: UsersRound },
    ];
  }

  if (role === "fpo") {
    return [
      { href: "/fpo", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/fpo/members", label: "Members", icon: UsersRound },
      { href: "/fpo/supply", label: "Supply", icon: Layers3 },
      { href: "/fpo/requirements", label: "Buyer Requests", icon: Building2 },
      { href: "/orders", label: "Deals", icon: ShoppingBasket },
      { href: "/fpo/logistics", label: "Logistics", icon: Truck },
      { href: "/fpo/analytics", label: "Analytics", icon: BarChart3 },
    ];
  }

  if (role === "buyer") {
    return [
      { href: "/buyer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/buyer/discover", label: "Discover Supply", icon: Search },
      { href: "/buyer/procurement", label: "Procurement", icon: FileCheck2 },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/orders", label: "Deals", icon: ShoppingBasket },
      { href: "/intelligence", label: "Market", icon: BarChart3 },
    ];
  }

  if (role === "consumer") {
    return [
      { href: "/consumer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/consumer/discover", label: "Discover", icon: Search },
      { href: "/consumer/shop", label: "Shop", icon: ShoppingBasket },
      { href: "/consumer/orders", label: "Orders", icon: FileCheck2 },
      { href: "/consumer/following", label: "Following", icon: Heart },
    ];
  }

  if (role === "admin") {
    return [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/admin/users", label: "Users", icon: UsersRound },
      { href: "/admin/marketplace", label: "Marketplace", icon: Store },
      { href: "/admin/transactions", label: "Transactions", icon: ShoppingBasket },
      { href: "/admin/trust", label: "Trust & Safety", icon: ShieldCheck },
      { href: "/admin/disputes", label: "Disputes", icon: Scale },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ];
  }

  // Expert fallback
  return [
    { href: "/network", label: "Network Feed", icon: UsersRound, exact: true },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/intelligence", label: "Market Trends", icon: BarChart3 },
    { href: "/messages", label: "Inquiries", icon: MessageSquare },
  ];
}
