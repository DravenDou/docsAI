import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { getSession } from "@/src/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return <LandingPage />;
}
