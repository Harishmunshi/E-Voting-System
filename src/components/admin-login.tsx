"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { readApiJson } from "@/lib/client-api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const body = await readApiJson(response);
    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "Unable to sign in.");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="mx-auto mt-16 w-full max-w-md p-7">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-maroon-600">Admin Portal</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1A1A1A]">Secure sign in</h2>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <Input name="email" type="email" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <Input name="password" type="password" required />
        </label>
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button className="h-[54px] w-full rounded-[14px]" disabled={loading}>
          <LockKeyhole size={18} aria-hidden="true" />
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
