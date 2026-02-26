import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "tw:bg-popover tw:text-popover-foreground tw:data-open:animate-in tw:data-closed:animate-out tw:data-closed:fade-out-0 tw:data-open:fade-in-0 tw:data-closed:zoom-out-95 tw:data-open:zoom-in-95 tw:data-[side=bottom]:slide-in-from-top-2 tw:data-[side=left]:slide-in-from-right-2 tw:data-[side=right]:slide-in-from-left-2 tw:data-[side=top]:slide-in-from-bottom-2 tw:ring-foreground/10 tw:flex tw:flex-col tw:gap-2.5 tw:rounded-lg tw:p-2.5 tw:text-sm tw:shadow-md tw:ring-1 tw:duration-100 tw:z-50 tw:w-72 tw:origin-(--radix-popover-content-transform-origin) tw:outline-hidden",
          className
        )}
        {...props} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="popover-header"
      className={cn("tw:flex tw:flex-col tw:gap-0.5 tw:text-sm", className)}
      {...props} />
  );
}

function PopoverTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="popover-title"
      className={cn("tw:font-medium", className)}
      {...props} />
  );
}

function PopoverDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="popover-description"
      className={cn("tw:text-muted-foreground", className)}
      {...props} />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
