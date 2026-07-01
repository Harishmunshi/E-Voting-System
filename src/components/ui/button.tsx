import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border border-gold-500 bg-gold-500 text-maroon-900 shadow-soft hover:border-gold-400 hover:bg-gradient-to-r hover:from-gold-400 hover:via-gold-500 hover:to-gold-100",
        variant === "secondary" && "border border-gold-500/35 bg-maroon-900/40 text-maroon-50 hover:border-gold-500 hover:bg-maroon-700",
        variant === "ghost" && "text-maroon-100 hover:bg-maroon-700",
        variant === "danger" && "border border-red-400/40 bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}
