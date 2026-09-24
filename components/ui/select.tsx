import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-2 focus:outline-emerald-100",
        className
      )}
      {...props}
    />
  );
}
