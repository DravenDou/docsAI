"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { isLanguage, normalizeLanguage, translations, type Dictionary, type Language } from "@/src/lib/i18n";

const LANGUAGE_STORAGE_KEY = "docsai-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const nextLanguage = isLanguage(stored) ? stored : normalizeLanguage(window.navigator.language);
    document.documentElement.lang = nextLanguage;
    const frame = window.requestAnimationFrame(() => {
      setLanguageState(nextLanguage);
      setIsLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [isLoaded, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
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
