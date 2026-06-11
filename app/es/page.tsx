import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { LanguageProvider } from "@/components/language-provider";
import { getSession } from "@/src/lib/auth";

export default async function SpanishHomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard/es");

  return (
    <LanguageProvider language="es">
      <LandingPage />
    </LanguageProvider>
  );
}
