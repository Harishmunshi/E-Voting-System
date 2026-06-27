import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  id: z.string().uuid().optional(),
  standard: z.string().min(1).max(20),
  division: z.string().min(1).max(5),
  roll_number: z.number().int().positive().max(999),
  full_name: z.string().max(120).optional().nullable(),
});

async function audit(actor: string, action: string, entityId?: string) {
  await getSupabaseAdmin().from("admin_audit_logs").insert({ actor_email: actor, action, entity: "student", entity_id: entityId });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid student." }, { status: 400 });

  const { error, data } = await getSupabaseAdmin().from("students").insert(parsed.data).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "create", data.id);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.required({ id: true }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid student." }, { status: 400 });

  const { id, ...student } = parsed.data;
  const { error } = await getSupabaseAdmin().from("students").update(student).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "update", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await getSupabaseAdmin().from("students").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(session.email, "delete", id);
  return NextResponse.json({ ok: true });
}
