import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/brand-shell";
import { VotingClient } from "@/components/voting-client";
import { getBallot, getElectionSettings } from "@/lib/data";
import { getStudentSession } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await getStudentSession();
  if (!session) redirect("/");
  const settings = await getElectionSettings();
  if (!settings.election_enabled) redirect("/");
  const ballot = await getBallot();

  return (
    <main className="min-h-screen">
      <BrandHeader eyebrow="Secure Ballot" />
      <VotingClient
        initialPayload={{
          ballot,
          student: {
            standard: session.standard,
            division: session.division,
            rollNumber: session.rollNumber,
          },
        }}
      />
    </main>
  );
}
