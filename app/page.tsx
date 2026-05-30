import { redirect } from "next/navigation";
import { FileSearch, Lock, MessageSquareQuote, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/src/lib/auth";

const highlights = [
  {
    icon: FileSearch,
    title: "Parseo con LiteParse",
    description: "Sube PDFs, extrae texto por página y conserva metadatos para citas.",
  },
  {
    icon: MessageSquareQuote,
    title: "RAG con citas",
    description: "Las respuestas deben citar documento, página y chunk recuperado.",
  },
  {
    icon: ShieldCheck,
    title: "Local-first en VPS",
    description: "PostgreSQL/pgvector y archivos privados sin S3 ni servicios extra.",
  },
  {
    icon: Lock,
    title: "Autenticación incluida",
    description: "Better Auth protege documentos, chat y jobs por usuario.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_35%),linear-gradient(180deg,#fff,#f8fafc)] transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_35%),linear-gradient(180deg,#020617,#0f172a)]">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle className="bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80" />
      </div>
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <Badge variant="outline" className="w-fit bg-white/70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            Portfolio • Open source • RAG empresarial
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl dark:text-slate-50">
              Chatea con tus documentos sin sobre-ingeniería.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Un starter RAG profesional con Next.js, Vercel AI SDK, LiteParse, Drizzle, PostgreSQL/pgvector,
              Graphile Worker y Better Auth. Pensado para verse bien en portafolio y ser fácil de auditar.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="border-slate-200 bg-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:shadow-slate-950/40"
              >
                <CardContent className="flex gap-4 p-5">
                  <item.icon className="mt-1 h-5 w-5 shrink-0 text-slate-900 dark:text-slate-100" aria-hidden="true" />
                  <div>
                    <h2 className="font-medium text-slate-950 dark:text-slate-50">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
