"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const dictionaries: Record<Language, any> = {
  en,
  hi,
};

function resolvePath(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  if (path in obj && typeof obj[path] === "string") return obj[path];
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("farmnex_lang") as Language;
    if (saved && (saved === "en" || saved === "hi")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("farmnex_lang", lang);
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = dictionaries[language] || dictionaries.en;
    const value = resolvePath(currentDict, key);
    if (value !== undefined) return value;
    const fallbackValue = resolvePath(dictionaries.en, key);
    if (fallbackValue !== undefined) return fallbackValue;
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export const useLanguage = useTranslation;

