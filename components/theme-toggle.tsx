"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={toggleTheme}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolvedTheme}
          aria-hidden="true"
          initial={shouldReduceMotion ? false : { opacity: 0, rotate: -20, scale: 0.85 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, rotate: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, rotate: 20, scale: 0.85 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
