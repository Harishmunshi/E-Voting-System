import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/brand-shell";
import { VotingClient } from "@/components/voting-client";
import { getStudentSession } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await getStudentSession();
  if (!session) redirect("/");

  return (
    <main className="min-h-screen">
      <BrandHeader eyebrow="Secure Ballot" />
      <VotingClient />
    </main>
  );
}
