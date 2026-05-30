"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "bussi-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const applyTheme = useCallback((nextTheme: Theme) => {
    const resolved = resolveTheme(nextTheme);
    document.documentElement.classList.toggle("dark", resolved === "dark");
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedTheme = readStoredTheme();
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") applyTheme("system");
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [applyTheme, theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider.");
  return value;
}

function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
