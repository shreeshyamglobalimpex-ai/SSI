import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  size?: "default" | "icon";
  }
>(({ className, variant = "primary", size = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
      size === "icon" && "size-10 min-h-0 px-0",
      variant === "primary" && "bg-emerald-700 text-white hover:bg-emerald-800",
      variant === "secondary" && "bg-slate-900 text-white hover:bg-slate-800",
      variant === "outline" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      className,
    )}
    {...props}
  />
));

Button.displayName = "Button";
