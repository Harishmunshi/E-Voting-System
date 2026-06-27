import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBallot } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase";
import { clearStudentSession, getStudentSession } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  votes: z.array(z.object({
    position_id: z.string().uuid(),
    candidate_id: z.string().uuid(),
  })).min(1),
});

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Student session expired. Please log in again." }, { status: 401 });

  const limited = rateLimit(`vote:${session.studentId}`, 3, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many submit attempts." }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ballot." }, { status: 400 });

  const ballot = await getBallot();
  const expected = new Set(ballot.map((position) => position.id));
  const submitted = new Set(parsed.data.votes.map((vote) => vote.position_id));
  const candidateByPosition = new Map(ballot.flatMap((position) => position.candidates.map((candidate) => [`${position.id}:${candidate.id}`, true])));

  if (expected.size !== submitted.size || [...expected].some((positionId) => !submitted.has(positionId))) {
    return NextResponse.json({ error: "Please vote for every position before submitting." }, { status: 400 });
  }

  if (parsed.data.votes.some((vote) => !candidateByPosition.has(`${vote.position_id}:${vote.candidate_id}`))) {
    return NextResponse.json({ error: "One or more selections are invalid." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().rpc("submit_anonymous_ballot", {
    p_student_id: session.studentId,
    p_votes: parsed.data.votes,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });

  await clearStudentSession();
  return NextResponse.json({ ok: true });
}
