import * as React from "react"

import { cn } from "../../lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "tw:dark:bg-input/30 tw:border-input tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:disabled:bg-input/50 tw:dark:disabled:bg-input/80 tw:h-8 tw:rounded-lg tw:border tw:bg-transparent tw:px-2.5 tw:py-1 tw:text-base tw:transition-colors tw:file:h-6 tw:file:text-sm tw:file:font-medium tw:focus-visible:ring-3 tw:aria-invalid:ring-3 tw:md:text-sm tw:file:text-foreground tw:placeholder:text-muted-foreground tw:w-full tw:min-w-0 tw:outline-none tw:file:inline-flex tw:file:border-0 tw:file:bg-transparent tw:disabled:pointer-events-none tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Input }
