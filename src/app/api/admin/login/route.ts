import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { setAdminSession, verifyAdminPassword } from "@/lib/security";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`admin-login:${ip}`, 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });

  const configuredEmail = process.env.ADMIN_EMAIL;
  if (!configuredEmail || parsed.data.email.toLowerCase() !== configuredEmail.toLowerCase()) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyAdminPassword(parsed.data.password);
  if (!valid) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  await setAdminSession(configuredEmail);
  return NextResponse.json({ ok: true });
}
