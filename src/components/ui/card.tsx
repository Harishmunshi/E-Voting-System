import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[20px] border border-slate-200 bg-white shadow-premium", className)} {...props} />;
}
