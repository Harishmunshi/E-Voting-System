import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm placeholder:text-slate-400",
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
        "focus-ring min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm",
        props.className,
      )}
    />
  );
}
