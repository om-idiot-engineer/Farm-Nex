"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-800 backdrop-blur border border-emerald-200 rounded-full px-2 py-1 shadow-sm text-xs sm:text-sm font-medium">
      <Globe className="w-4 h-4 text-emerald-600" />
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        className={`px-2.5 py-0.5 rounded-full transition-colors ${
          language === "hi"
            ? "bg-emerald-600 text-white font-semibold shadow-xs"
            : "text-zinc-600 hover:text-emerald-700"
        }`}
      >
        हिंदी
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-0.5 rounded-full transition-colors ${
          language === "en"
            ? "bg-emerald-600 text-white font-semibold shadow-xs"
            : "text-zinc-600 hover:text-emerald-700"
        }`}
      >
        English
      </button>
    </div>
  );
}
