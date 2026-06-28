import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border border-maroon-600 bg-maroon-600 text-white shadow-soft hover:border-gold-600 hover:bg-maroon-900",
        variant === "secondary" && "border border-slate-200 bg-white text-maroon-900 hover:border-gold-600 hover:bg-gold-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}
