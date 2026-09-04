import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import PWAProvider from "@/components/PWAProvider";
import { UserProvider } from "@/lib/auth/UserContext";

export const metadata: Metadata = {
  title: "Farm-Nex | Direct Farmer-to-Buyer Sales",
  description: "Direct farm-to-buyer sales with net realization ranking, transparent logistics, and real mandi intelligence.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <PWAProvider>
          <LanguageProvider>
            <UserProvider>
              <Navbar />
              <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-20 sm:p-6 sm:pb-6 lg:p-8">
                {children}
              </main>
              <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
                  <p>FarmNex © 2026</p>
                  <div className="flex items-center gap-3 font-medium text-primary">
                    <span>Direct farmer realization</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Transparent logistics</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Market data context</span>
                  </div>
                </div>
              </footer>
            </UserProvider>
          </LanguageProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
