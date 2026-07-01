import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-gold-500/25 bg-maroon-600 text-maroon-50 shadow-premium", className)} {...props} />;
}
