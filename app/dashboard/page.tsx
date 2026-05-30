import { redirect } from "next/navigation";

import { RagWorkspace } from "@/components/rag-workspace";
import { getSession } from "@/src/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/");

  return <RagWorkspace userEmail={session.user.email} />;
}
