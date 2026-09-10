import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import AppFooter from "@/components/AppFooter";
import PWAProvider from "@/components/PWAProvider";
import { UserProvider } from "@/lib/auth/UserContext";
import ThemeProvider from "@/components/ThemeProvider";

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
              <ThemeProvider>
                <Navbar />
                <MainLayoutWrapper>{children}</MainLayoutWrapper>
                <AppFooter />
              </ThemeProvider>
            </UserProvider>
          </LanguageProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
