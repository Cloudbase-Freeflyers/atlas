import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:rounded-lg tw:border tw:border-transparent tw:bg-clip-padding tw:text-sm tw:font-medium tw:focus-visible:ring-3 tw:aria-invalid:ring-3 tw:[&_svg:not([class*=size-])]:size-4 tw:inline-flex tw:items-center tw:justify-center tw:whitespace-nowrap tw:transition-all tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:[&_svg]:pointer-events-none tw:shrink-0 tw:[&_svg]:shrink-0 tw:outline-none tw:group/button tw:select-none",
  {
    variants: {
      variant: {
        default: "tw:bg-primary tw:text-primary-foreground tw:[a]:hover:bg-primary/80",
        outline: "tw:border-border tw:bg-background tw:hover:bg-muted tw:hover:text-foreground tw:dark:bg-input/30 tw:dark:border-input tw:dark:hover:bg-input/50 tw:aria-expanded:bg-muted tw:aria-expanded:text-foreground",
        secondary: "tw:bg-secondary tw:text-secondary-foreground tw:hover:bg-secondary/80 tw:aria-expanded:bg-secondary tw:aria-expanded:text-secondary-foreground",
        ghost: "tw:hover:bg-muted tw:hover:text-foreground tw:dark:hover:bg-muted/50 tw:aria-expanded:bg-muted tw:aria-expanded:text-foreground",
        destructive: "tw:bg-destructive/10 tw:hover:bg-destructive/20 tw:focus-visible:ring-destructive/20 tw:dark:focus-visible:ring-destructive/40 tw:dark:bg-destructive/20 tw:text-destructive tw:focus-visible:border-destructive/40 tw:dark:hover:bg-destructive/30",
        link: "tw:text-primary tw:underline-offset-4 tw:hover:underline",
      },
      size: {
        default: "tw:h-8 tw:gap-1.5 tw:px-2.5 tw:has-data-[icon=inline-end]:pr-2 tw:has-data-[icon=inline-start]:pl-2",
        xs: "tw:h-6 tw:gap-1 tw:rounded-[min(var(--radius-md),10px)] tw:px-2 tw:text-xs tw:in-data-[slot=button-group]:rounded-lg tw:has-data-[icon=inline-end]:pr-1.5 tw:has-data-[icon=inline-start]:pl-1.5 tw:[&_svg:not([class*=size-])]:size-3",
        sm: "tw:h-7 tw:gap-1 tw:rounded-[min(var(--radius-md),12px)] tw:px-2.5 tw:text-[0.8rem] tw:in-data-[slot=button-group]:rounded-lg tw:has-data-[icon=inline-end]:pr-1.5 tw:has-data-[icon=inline-start]:pl-1.5 tw:[&_svg:not([class*=size-])]:size-3.5",
        lg: "tw:h-9 tw:gap-1.5 tw:px-2.5 tw:has-data-[icon=inline-end]:pr-3 tw:has-data-[icon=inline-start]:pl-3",
        icon: "tw:size-8",
        "icon-xs": "tw:size-6 tw:rounded-[min(var(--radius-md),10px)] tw:in-data-[slot=button-group]:rounded-lg tw:[&_svg:not([class*=size-])]:size-3",
        "icon-sm": "tw:size-7 tw:rounded-[min(var(--radius-md),12px)] tw:in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "tw:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
