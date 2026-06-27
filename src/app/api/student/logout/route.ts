import { NextResponse } from "next/server";
import { clearStudentSession } from "@/lib/security";

export async function POST() {
  await clearStudentSession();
  return NextResponse.json({ ok: true });
}
