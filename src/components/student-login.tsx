"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { DIVISIONS, STANDARDS } from "@/lib/constants";
import { readApiJson } from "@/lib/client-api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Select } from "./ui/input";

export function StudentLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        standard: form.get("standard"),
        division: form.get("division"),
        rollNumber: Number(form.get("rollNumber")),
      }),
    });
    const payload = await readApiJson(response);
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to start voting.");
      return;
    }

    router.push("/vote");
  }

  return (
    <Card className="w-full max-w-md p-7">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-maroon-600">Student Login</p>
          <h2 className="mt-2 text-3xl font-bold text-[#111844]">Begin secure voting</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your class, division, and roll number to begin voting.</p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Standard</span>
          <Select name="standard" required defaultValue="">
            <option value="" disabled>Select standard</option>
            {STANDARDS.map((standard) => <option key={standard}>{standard}</option>)}
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Division</span>
          <Select name="division" required defaultValue="">
            <option value="" disabled>Select division</option>
            {DIVISIONS.map((division) => <option key={division}>{division}</option>)}
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Roll Number</span>
          <Input name="rollNumber" type="number" min={1} max={999} required placeholder="27" />
        </label>
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button className="h-[54px] w-full rounded-[14px]" disabled={loading}>
          <LogIn size={18} aria-hidden="true" />
          {loading ? "Checking..." : "Continue"}
        </Button>
      </form>
    </Card>
  );
}
