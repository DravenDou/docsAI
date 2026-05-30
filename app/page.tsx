import { redirect } from "next/navigation";
import { ArrowRight, Database, FileSearch, LockKeyhole, MessageSquareQuote, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/src/lib/auth";
import { cn } from "@/src/lib/utils";

const highlights = [
  {
    icon: FileSearch,
    title: "Parseo confiable",
    description: "LiteParse extrae contenido por página para que cada respuesta conserve trazabilidad real.",
    className: "lg:col-span-7 lg:row-span-2",
  },
  {
    icon: MessageSquareQuote,
    title: "RAG con citas",
    description: "Cada afirmación importante debe venir de documento, página y chunk.",
    className: "lg:col-span-5",
  },
  {
    icon: Database,
    title: "pgvector",
    description: "PostgreSQL local, Drizzle y búsqueda vectorial sin servicios extra.",
    className: "lg:col-span-3",
  },
  {
    icon: ShieldCheck,
    title: "VPS privado",
    description: "Archivos y base de datos sin exponer recursos internos.",
    className: "lg:col-span-2",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-app-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(15,23,42,0.10),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(15,23,42,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_24%)]" />
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-[var(--radius-row)] border border-app-border bg-app-surface-raised shadow-sm">
            <LockKeyhole className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">DOCSAI</p>
            <p className="text-xs text-app-text-muted">Open source RAG assistant</p>
          </div>
        </div>
        <ThemeToggle className="rounded-full border-app-border bg-app-surface-raised shadow-sm" />
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-7xl gap-10 px-5 pb-12 pt-6 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center lg:gap-12">
        <div className="space-y-10">
          <div className="space-y-7">
            <div className="flex w-fit flex-wrap items-center gap-2 rounded-full border border-app-border bg-app-surface-raised/80 px-3 py-2 text-xs font-medium text-app-text-muted shadow-sm backdrop-blur">
              <span>Portfolio</span>
              <span className="h-3 w-px bg-app-border" aria-hidden="true" />
              <span>Open source</span>
              <span className="h-3 w-px bg-app-border" aria-hidden="true" />
              <span>Enterprise docs</span>
            </div>
            <div className="max-w-6xl space-y-5">
              <h1 className="max-w-6xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.07em] text-foreground">
                Chatea con tus documentos con respuestas citadas.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-app-text-muted md:text-lg">
                DOCSAI es un starter RAG profesional con Next.js, Vercel AI SDK, LiteParse, Drizzle,
                PostgreSQL/pgvector, Graphile Worker y Better Auth. Directo, auditable y listo para portafolio.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Entrar al demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/DravenDou/docsAI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-app-surface-raised px-5 text-sm font-medium shadow-sm transition hover:bg-app-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Ver repositorio
              </a>
            </div>
          </div>

          <div className="grid grid-flow-dense auto-rows-[minmax(150px,auto)] gap-3 lg:grid-cols-12 lg:grid-rows-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-panel)] border border-app-border bg-app-surface-raised p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--app-glow)]",
                  item.className,
                )}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                <item.icon className="mb-5 size-5 text-foreground transition duration-300 group-hover:scale-105" aria-hidden="true" />
                <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-app-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="login" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2rem] bg-foreground/[0.03] blur-2xl dark:bg-white/[0.04]" />
          <AuthForm />
        </div>
      </section>
    </main>
  );
}
