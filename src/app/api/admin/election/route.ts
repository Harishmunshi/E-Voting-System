import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  action: z.enum([
    "enable",
    "disable",
    "lock_results",
    "publish_results",
    "reset_election",
    "reset_voting_status",
    "clear_students",
    "restore_candidate_entries",
  ]),
  principalCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const action = parsed.data.action;

  if (action === "publish_results" && parsed.data.principalCode !== process.env.PRINCIPAL_UNLOCK_CODE) {
    return NextResponse.json({ error: "Principal approval code is required." }, { status: 403 });
  }

  if (action === "enable") {
    await supabase.from("election_settings").update({ election_enabled: true, updated_at: new Date().toISOString() }).eq("id", true);
  }
  if (action === "disable") {
    await supabase.from("election_settings").update({ election_enabled: false, updated_at: new Date().toISOString() }).eq("id", true);
  }
  if (action === "lock_results") {
    await supabase.from("election_settings").update({ results_locked: true, results_published: false, updated_at: new Date().toISOString() }).eq("id", true);
  }
  if (action === "publish_results") {
    await supabase.from("election_settings").update({
      results_locked: false,
      results_published: true,
      principal_approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", true);
  }
  if (action === "reset_voting_status") {
    await supabase.from("students").update({ has_voted: false, voted_at: null, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (action === "reset_election") {
    await supabase.from("students").update({ has_voted: false, voted_at: null, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("candidates").update({ vote_count: 0, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("election_settings").update({
      election_enabled: false,
      results_locked: true,
      results_published: false,
      principal_approved_at: null,
      updated_at: new Date().toISOString(),
    }).eq("id", true);
  }
  if (action === "clear_students") {
    await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (action === "restore_candidate_entries") {
    await supabase.from("candidates").delete().neq("name", "NOTA");
    await supabase.from("candidates").update({ vote_count: 0, is_active: true, updated_at: new Date().toISOString() }).eq("name", "NOTA");
  }

  await supabase.from("admin_audit_logs").insert({ actor_email: session.email, action, entity: "election" });
  return NextResponse.json({ ok: true });
}
