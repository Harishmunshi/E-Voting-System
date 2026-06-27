import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [headerLine, ...rows] = lines;
  if (!headerLine) return [];
  const headers = headerLine.split(",").map((header) => header.trim().toLowerCase());

  return rows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return {
      standard: record.standard,
      division: record.division,
      roll_number: Number(record.roll_number),
      full_name: record.full_name || null,
    };
  }).filter((student) => student.standard && student.division && Number.isInteger(student.roll_number));
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "CSV file is required." }, { status: 400 });

  const students = parseCsv(await file.text());
  if (!students.length) return NextResponse.json({ error: "No valid students found." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("students").upsert(students, { onConflict: "standard,division,roll_number" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("admin_audit_logs").insert({
    actor_email: session.email,
    action: "bulk_import",
    entity: "student",
    metadata: { count: students.length },
  });

  return NextResponse.json({ ok: true, imported: students.length });
}
