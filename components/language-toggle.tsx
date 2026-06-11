"use client";

import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { languageLabels, languages } from "@/src/lib/i18n";
import { cn } from "@/src/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-app-border bg-app-surface-raised p-0.5 text-xs font-medium shadow-sm",
        className,
      )}
    >
      {languages.map((item) => {
        const isActive = item === language;
        return (
          <Button
            key={item}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={isActive}
            aria-label={`${t.common.switchLanguage}: ${item === "es" ? t.common.spanish : t.common.english}`}
            className={cn(
              "relative h-8 min-w-10 rounded-full px-3 text-xs hover:bg-transparent",
              isActive ? "text-background" : "text-app-text-muted hover:text-foreground",
            )}
            onClick={() => setLanguage(item)}
          >
            {isActive ? (
              <motion.span
                layoutId="docsai-language-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{languageLabels[item]}</span>
          </Button>
        );
      })}
    </div>
  );
}
