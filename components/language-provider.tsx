"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

import { translations, type Dictionary, type Language } from "@/src/lib/i18n";

type LanguageContextValue = {
  language: Language;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, language }: { children: React.ReactNode; language: Language }) {
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: translations[language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
