"use client";

import React from "react";
import { usePathname } from "next/navigation";

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
    <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-20 sm:p-6 sm:pb-6 lg:p-8">
      {children}
    </main>
  );
}
