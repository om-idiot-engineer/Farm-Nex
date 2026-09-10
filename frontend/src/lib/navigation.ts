import type { UserProfile } from "@/lib/api";
import {
  LayoutDashboard,
  Sprout,
  Store,
  UsersRound,
  ShoppingBasket,
  FileText,
  MessageSquare,
  Plus,
  Handshake,
  ClipboardList
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
  if (role === "fpo") return "/farmer";
  if (role === "consumer") return "/buyer";
  if (role === "expert") return "/network";
  return "/farmer";
}

export function getRolePrimaryAction(role?: UserProfile["role"]): RolePrimaryAction {
  if (role === "farmer" || role === "fpo") {
    return { label: "List Produce", href: "/farmer/produce/new", icon: Plus };
  }
  if (role === "buyer" || role === "consumer") {
    return { label: "Post Requirement", href: "/buyer/requirements/new", icon: Plus };
  }
  return { label: "Explore Market", href: "/marketplace", icon: Store };
}

export function getRoleNavigation(role?: UserProfile["role"]): NavLinkItem[] {
  if (!role) return [];

  const isBuyer = role === "buyer" || role === "consumer";

  return [
    { href: getRoleHome(role), label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/marketplace", label: isBuyer ? "Find Supply" : "Market", icon: Store },
    ...(isBuyer
      ? [{ href: "/buyer/requirements", label: "My Requirements", icon: ClipboardList }]
      : [{ href: "/farmer/produce", label: "My Produce", icon: Sprout }]
    ),
    { href: "/network", label: "Network", icon: UsersRound },
    { href: "/deals", label: "Deals", icon: Handshake },
    { href: "/messages", label: "Messages", icon: MessageSquare }
  ];
}

export function getMobileNavigation(role?: UserProfile["role"]): NavLinkItem[] {
  if (!role) return [];
  const isBuyer = role === "buyer" || role === "consumer";

  return [
    { href: getRoleHome(role), label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/marketplace", label: isBuyer ? "Supply" : "Market", icon: Store },
    { href: "/network", label: "Network", icon: UsersRound },
    { href: "/deals", label: "Deals", icon: Handshake },
    { href: "/messages", label: "Messages", icon: MessageSquare }
  ];
}
