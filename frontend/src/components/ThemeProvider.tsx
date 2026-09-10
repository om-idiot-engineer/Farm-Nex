"use client";

import React, { useEffect } from "react";
import { useUser } from "@/lib/auth/UserContext";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    if (user?.role === "buyer" || user?.role === "consumer") {
      document.body.classList.add("theme-buyer");
    } else {
      document.body.classList.remove("theme-buyer");
    }
  }, [user?.role]);

  return <>{children}</>;
}
