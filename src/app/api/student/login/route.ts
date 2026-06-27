import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { setStudentSession } from "@/lib/security";

const schema = z.object({
  standard: z.string().min(1).max(20),
  division: z.string().min(1).max(5),
  rollNumber: z.number().int().positive().max(999),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`student-login:${ip}`, 18, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid login details." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: settings, error: settingsError } = await supabase
    .from("election_settings")
    .select("election_enabled")
    .eq("id", true)
    .single();

  if (settingsError) return NextResponse.json({ error: "Election settings unavailable." }, { status: 500 });
  if (!settings.election_enabled) return NextResponse.json({ error: "Voting is not enabled right now." }, { status: 403 });

  const { standard, division, rollNumber } = parsed.data;
  const { data: student, error } = await supabase
    .from("students")
    .select("id, standard, division, roll_number, has_voted")
    .eq("standard", standard)
    .eq("division", division)
    .eq("roll_number", rollNumber)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not validate student." }, { status: 500 });
  if (!student) return NextResponse.json({ error: "Invalid student details." }, { status: 401 });
  if (student.has_voted) return NextResponse.json({ error: "This student has already voted." }, { status: 409 });

  await setStudentSession({
    studentId: student.id,
    standard: student.standard,
    division: student.division,
    rollNumber: student.roll_number,
  });

  return NextResponse.json({ ok: true });
}
