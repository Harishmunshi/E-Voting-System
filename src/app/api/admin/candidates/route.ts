import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  id: z.string().uuid().optional(),
  position_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  standard: z.string().min(1).max(20),
  division: z.string().max(5).optional().nullable(),
  photo_url: z.string().url().optional().nullable().or(z.literal("")),
  manifesto: z.string().max(240).optional().nullable(),
  is_active: z.boolean().default(true),
});

async function audit(actor: string, action: string, entityId?: string) {
  await getSupabaseAdmin().from("admin_audit_logs").insert({ actor_email: actor, action, entity: "candidate", entity_id: entityId });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid candidate." }, { status: 400 });

  const candidate = { ...parsed.data, photo_url: parsed.data.photo_url || null };
  const { error, data } = await getSupabaseAdmin().from("candidates").insert(candidate).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "create", data.id);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.required({ id: true }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid candidate." }, { status: 400 });

  const { id, ...candidate } = parsed.data;
  const { error } = await getSupabaseAdmin().from("candidates").update({ ...candidate, photo_url: candidate.photo_url || null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "update", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("candidates")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "delete", id);
  return NextResponse.json({ ok: true });
}
