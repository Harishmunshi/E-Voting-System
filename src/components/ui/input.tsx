import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring min-h-12 w-full rounded-lg border border-gold-500/25 bg-maroon-900/70 px-4 text-base text-maroon-50 shadow-sm placeholder:text-maroon-100/50",
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
        "focus-ring min-h-12 w-full rounded-lg border border-gold-500/25 bg-maroon-900/70 px-4 text-base text-maroon-50 shadow-sm",
        props.className,
      )}
    />
  );
}
