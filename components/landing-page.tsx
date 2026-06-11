"use client";

import { ArrowRight, Database, FileSearch, LockKeyhole, MessageSquareQuote, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";

export function LandingPage() {
  const { t } = useLanguage();
  const highlights = [
    {
      icon: FileSearch,
      title: t.landing.highlights.parse.title,
      description: t.landing.highlights.parse.description,
    },
    {
      icon: MessageSquareQuote,
      title: t.landing.highlights.citations.title,
      description: t.landing.highlights.citations.description,
    },
    {
      icon: Database,
      title: t.landing.highlights.pgvector.title,
      description: t.landing.highlights.pgvector.description,
    },
    {
      icon: ShieldCheck,
      title: t.landing.highlights.privateVps.title,
      description: t.landing.highlights.privateVps.description,
    },
  ];

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-app-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(15,23,42,0.11),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(37,99,235,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_18%_4%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(148,163,184,0.08),transparent_24%)]" />
      <nav className="relative z-10 mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-5 py-5 md:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-row)] border border-app-border bg-app-surface-raised shadow-sm">
            <LockKeyhole className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">DOCSAI</p>
            <p className="truncate text-xs text-app-text-muted">{t.landing.tagline}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle className="rounded-full border-app-border bg-app-surface-raised shadow-sm" />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-[88rem] gap-8 px-5 pb-10 pt-3 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(390px,440px)] lg:items-start lg:gap-10 lg:px-10 lg:pb-12 lg:pt-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(410px,460px)] xl:gap-14">
        <div className="min-w-0 space-y-8 lg:space-y-9">
          <div className="space-y-6">
            <div className="flex w-fit flex-wrap items-center gap-2 rounded-full border border-app-border bg-app-surface-raised/85 px-3 py-2 text-xs font-medium text-app-text-muted shadow-sm backdrop-blur">
              <span>{t.landing.badgeProfessional}</span>
              <span className="h-3 w-px bg-app-border" aria-hidden="true" />
              <span>{t.landing.badgeOpenSource}</span>
              <span className="h-3 w-px bg-app-border" aria-hidden="true" />
              <span>{t.landing.badgeEnterpriseDocs}</span>
            </div>

            <div className="max-w-5xl space-y-5">
              <h1 className="text-balance text-[clamp(2.75rem,5.35vw,5.85rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-foreground">
                {t.landing.title}
              </h1>
              <p className="max-w-3xl text-pretty text-base leading-8 text-app-text-muted md:text-lg">
                {t.landing.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#login"
                className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.landing.enterDemo}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/DravenDou/docsAI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 min-w-36 items-center justify-center rounded-full border border-app-border bg-app-surface-raised px-5 text-sm font-medium shadow-sm transition hover:bg-app-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.landing.viewRepo}
              </a>
            </div>
          </div>

          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:max-w-5xl">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="group relative min-h-36 overflow-hidden rounded-[var(--radius-panel)] border border-app-border bg-app-surface-raised p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--app-glow)] md:p-6"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                <item.icon className="mb-5 size-5 text-foreground transition duration-300 group-hover:scale-105" aria-hidden="true" />
                <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-app-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="login" className="relative mx-auto w-full max-w-[28rem] self-start lg:sticky lg:top-8 lg:mx-0 lg:justify-self-end lg:pt-2">
          <div className="absolute -inset-4 rounded-[2rem] bg-foreground/[0.035] blur-2xl dark:bg-white/[0.045]" />
          <AuthForm />
        </div>
      </section>
    </main>
  );
}
