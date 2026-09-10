"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <div className="flex mx-auto w-full max-w-[1440px]">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-[88px] lg:pb-0">
        {children}
      </main>
    </div>
  );
}
