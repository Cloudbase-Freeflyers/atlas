import * as React from "react"

import { cn } from "../../lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "tw:border-input tw:dark:bg-input/30 tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:disabled:bg-input/50 tw:dark:disabled:bg-input/80 tw:rounded-lg tw:border tw:bg-transparent tw:px-2.5 tw:py-2 tw:text-base tw:transition-colors tw:focus-visible:ring-3 tw:aria-invalid:ring-3 tw:md:text-sm tw:placeholder:text-muted-foreground tw:flex tw:field-sizing-content tw:min-h-16 tw:w-full tw:outline-none tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Textarea }
