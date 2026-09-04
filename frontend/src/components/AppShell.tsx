"use client";

import React from "react";
import Navbar from "@/components/Navbar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
