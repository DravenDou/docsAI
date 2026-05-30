"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/src/lib/auth-client";

export function AuthForm() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const result = await authClient.signIn.email({ email, password });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "No se pudo iniciar sesión.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Card className="mx-auto w-full max-w-[28rem] gap-5 rounded-[1.5rem] border-app-border bg-app-surface-raised/95 py-6 shadow-[var(--app-glow)] backdrop-blur transition-colors duration-300">
        <CardHeader className="px-6">
          <CardTitle className="text-xl tracking-tight">Iniciar sesión</CardTitle>
          <CardDescription className="text-app-text-muted">
            El registro público está cerrado. Usa tu cuenta de prueba para revisar el demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-[var(--radius-row)] border-app-border bg-app-surface dark:bg-app-surface"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-[var(--radius-row)] border-app-border bg-app-surface dark:bg-app-surface"
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button className="h-11 w-full rounded-full" type="submit" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs leading-5 text-app-text-muted">
            Si necesitas otra cuenta, se habilita manualmente desde configuración del servidor.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
