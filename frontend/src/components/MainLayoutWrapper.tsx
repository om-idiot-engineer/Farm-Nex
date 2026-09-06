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
    <div className="flex flex-1 mx-auto w-full max-w-7xl">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pb-20 sm:p-6 sm:pb-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
