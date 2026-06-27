import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Photo file is required." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  if (file.size > 2_000_000) return NextResponse.json({ error: "Photo must be under 2 MB." }, { status: 400 });

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${randomUUID()}.${extension}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from("candidate-photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabase.storage.from("candidate-photos").getPublicUrl(path);
  await supabase.from("admin_audit_logs").insert({
    actor_email: session.email,
    action: "upload_photo",
    entity: "candidate_photo",
    entity_id: path,
  });

  return NextResponse.json({ url: data.publicUrl });
}
