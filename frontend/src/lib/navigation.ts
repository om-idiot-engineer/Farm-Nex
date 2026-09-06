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

export function getRoleHome(role: UserProfile["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "buyer") return "/buyer";
  if (role === "fpo") return "/fpo";
  if (role === "consumer") return "/consumer";
  if (role === "expert") return "/network";
  return "/farmer";
}

export function getRolePrimaryAction(role: UserProfile["role"]): RolePrimaryAction {
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

export function getRoleNavigation(role: UserProfile["role"]): NavLinkItem[] {
  if (role === "farmer") {
    return [
      { href: "/farmer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/farmer/produce", label: "My Produce", icon: Sprout },
      { href: "/farmer/buyers", label: "Find Buyers", icon: TrendingUp },
      { href: "/marketplace", label: "Marketplace", icon: Store },
      { href: "/orders", label: "Orders", icon: ShoppingBasket },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/community", label: "Community", icon: UsersRound },
      { href: "/farmer/market", label: "More", icon: BarChart3 },
    ];
  }

  if (role === "consumer") {
    return [
      { href: "/consumer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/consumer/discover", label: "Discover", icon: Compass },
      { href: "/consumer/shop", label: "Shop", icon: ShoppingBasket },
      { href: "/consumer/orders", label: "Orders", icon: FileCheck2 },
      { href: "/consumer/following", label: "Following", icon: Heart },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/marketplace", label: "More", icon: Store },
    ];
  }

  if (role === "buyer") {
    return [
      { href: "/buyer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/buyer/discover", label: "Find Supply", icon: Search },
      { href: "/buyer/procurement", label: "My Requirements", icon: FileText },
      { href: "/buyer/deals", label: "Deals", icon: Handshake },
      { href: "/orders", label: "Orders", icon: ShoppingBasket },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/intelligence", label: "Analytics", icon: BarChart3 },
    ];
  }

  if (role === "fpo") {
    return [
      { href: "/fpo", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/fpo/supply", label: "Supply", icon: Layers3 },
      { href: "/fpo/requirements", label: "Requirements", icon: Building2 },
      { href: "/fpo/deals", label: "Deals", icon: Handshake },
      { href: "/fpo/members", label: "Members", icon: UsersRound },
      { href: "/fpo/logistics", label: "Logistics", icon: Truck },
      { href: "/fpo/analytics", label: "Analytics", icon: BarChart3 },
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

export function getMobileNavigation(role: UserProfile["role"]): NavLinkItem[] {
  if (role === "farmer") {
    return [
      { href: "/farmer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/farmer/produce", label: "Produce", icon: Sprout },
      { href: "/farmer/buyers", label: "Buyers", icon: TrendingUp },
      { href: "/orders", label: "Orders", icon: ShoppingBasket },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ];
  }

  if (role === "consumer") {
    return [
      { href: "/consumer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/consumer/discover", label: "Discover", icon: Compass },
      { href: "/consumer/shop", label: "Shop", icon: ShoppingBasket },
      { href: "/consumer/orders", label: "Orders", icon: FileCheck2 },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ];
  }

  if (role === "buyer") {
    return [
      { href: "/buyer", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/buyer/discover", label: "Supply", icon: Search },
      { href: "/buyer/procurement", label: "RFQs", icon: FileText },
      { href: "/orders", label: "Orders", icon: ShoppingBasket },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ];
  }

  if (role === "fpo") {
    return [
      { href: "/fpo", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/fpo/supply", label: "Supply", icon: Layers3 },
      { href: "/fpo/requirements", label: "Demand", icon: Building2 },
      { href: "/fpo/members", label: "Members", icon: UsersRound },
      { href: "/orders", label: "Deals", icon: ShoppingBasket },
    ];
  }

  return [
    { href: "/admin", label: "Admin", icon: LayoutDashboard, exact: true },
    { href: "/admin/marketplace", label: "Market", icon: Store },
    { href: "/admin/transactions", label: "Trades", icon: ShoppingBasket },
    { href: "/admin/disputes", label: "Disputes", icon: Scale },
    { href: "/admin/users", label: "Users", icon: UsersRound },
  ];
}
