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
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-600 bg-gold-50 text-emerald-600">
        <CheckCircle2 size={56} aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-[#111844]">Your vote has been successfully recorded.</h2>
      <p className="mt-3 text-lg text-slate-600">Thank you. Your anonymous ballot is now secured for the Student Council Election.</p>
      <div className="mt-6 rounded-2xl border border-gold-600/40 bg-[#F7F8FC] px-4 py-4 text-maroon-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Automatic logout</p>
        <p className="mt-1 text-4xl font-bold">{seconds}</p>
      </div>
      <Button className="mt-6" onClick={() => router.replace("/")}>Return Now</Button>
    </Card>
  );
}
