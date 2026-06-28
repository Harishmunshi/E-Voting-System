import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm placeholder:text-slate-400",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm",
        props.className,
      )}
    />
  );
}
