import { NextResponse } from "next/server";
import { getBallot, getElectionSettings } from "@/lib/data";
import { getStudentSession } from "@/lib/security";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Student session required." }, { status: 401 });

  const settings = await getElectionSettings();
  if (!settings.election_enabled) return NextResponse.json({ error: "Voting is not enabled." }, { status: 403 });

  const ballot = await getBallot();
  return NextResponse.json({ ballot, student: { standard: session.standard, division: session.division, rollNumber: session.rollNumber } });
}
