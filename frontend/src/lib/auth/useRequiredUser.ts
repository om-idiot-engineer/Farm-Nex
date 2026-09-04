"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/api";
import { getRoleHome } from "@/lib/navigation";
import { useUser } from "@/lib/auth/UserContext";

export function useRequiredUser(roles?: readonly UserProfile["role"][]) {
  const router = useRouter();
  const { user, loading } = useUser();
  const allowedRoleKey = roles?.join("|") || "";
  const hasAccess = !roles || !user || roles.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!hasAccess) router.replace(getRoleHome(user.role));
  }, [allowedRoleKey, hasAccess, loading, router, user]);

  return { user, loading, hasAccess };
}
