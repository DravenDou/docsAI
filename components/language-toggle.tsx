"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { languageLabels, languages, type Language } from "@/src/lib/i18n";
import { cn } from "@/src/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  function targetPathFor(targetLanguage: Language) {
    const isDashboard = pathname.startsWith("/dashboard");
    if (targetLanguage === "es") return isDashboard ? "/dashboard/es" : "/es";
    return isDashboard ? "/dashboard" : "/";
  }

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-app-border-strong bg-app-surface p-0.5 text-xs font-semibold shadow-sm",
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
              "relative h-8 min-w-10 rounded-full px-3 text-xs transition hover:bg-app-hover focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-background hover:text-background" : "text-foreground",
            )}
            onClick={() => {
              if (!isActive) router.push(targetPathFor(item));
            }}
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
