"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserContext";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      const targetId = user?.id || "demo-farmer-ramesh";
      router.replace(`/profile/${targetId}`);
    }
  }, [user, loading, router]);

  return (
    <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
      <div className="h-48 bg-zinc-100 rounded-3xl animate-pulse"></div>
      <p className="text-sm font-semibold text-zinc-500">Loading your profile...</p>
    </div>
  );
}
