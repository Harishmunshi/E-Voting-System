"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function SuccessCountdown() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          fetch("/api/student/logout", { method: "POST" }).finally(() => router.replace("/"));
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <CheckCircle2 className="mx-auto text-emerald-600" size={56} aria-hidden="true" />
      <h2 className="mt-5 text-3xl font-bold text-slate-950">Vote Submitted Successfully</h2>
      <p className="mt-3 text-lg text-slate-600">Thank you. Your ballot has been recorded anonymously.</p>
      <div className="mt-6 rounded-lg bg-royal-50 px-4 py-4 text-royal-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Automatic logout</p>
        <p className="mt-1 text-4xl font-bold">{seconds}</p>
      </div>
      <Button className="mt-6" onClick={() => router.replace("/")}>Return Now</Button>
    </Card>
  );
}
