import * as React from "react";
export function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1.5 block text-sm font-medium text-slate-800" {...props}>{children}</label>;
}
