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
      <Card className="mx-auto w-full max-w-md border-slate-200 bg-white/90 shadow-xl shadow-slate-200/70 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-slate-950/40">
        <CardHeader>
          <CardTitle className="dark:text-slate-50">Iniciar sesión</CardTitle>
          <CardDescription className="dark:text-slate-400">
            El registro público está cerrado. Usa la cuenta de prueba que ya creaste para revisar el demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-200" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-200" htmlFor="password">
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
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            Si necesitas otra cuenta, se habilita manualmente desde configuración del servidor.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
