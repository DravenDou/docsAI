import { redirect } from "next/navigation";

import { RagWorkspace } from "@/components/rag-workspace";
import { getSession } from "@/src/lib/auth";
import { getUserModelAccess } from "@/src/lib/user-access";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/");

  return <RagWorkspace modelAccess={getUserModelAccess(session.user.email)} userEmail={session.user.email} />;
}
