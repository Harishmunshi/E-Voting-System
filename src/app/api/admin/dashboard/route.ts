import { NextResponse } from "next/server";
import { getAdminDashboard } from "@/lib/data";
import { getAdminSession } from "@/lib/security";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  return NextResponse.json(await getAdminDashboard());
}
