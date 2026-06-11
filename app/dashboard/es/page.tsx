import { redirect } from "next/navigation";

import { LanguageProvider } from "@/components/language-provider";
import { RagWorkspace } from "@/components/rag-workspace";
import { getSession } from "@/src/lib/auth";
import { getUserModelAccess } from "@/src/lib/user-access";

export default async function SpanishDashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/es");

  return (
    <LanguageProvider language="es">
      <RagWorkspace modelAccess={getUserModelAccess(session.user.email)} userEmail={session.user.email} />
    </LanguageProvider>
  );
}
