"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

// Modern React 19+ type definitions with proper constraints
type ComponentRef<T extends React.ElementType<any, keyof React.JSX.IntrinsicElements>> = React.ComponentRef<T>
type ComponentPropsWithoutRef<T extends React.ElementType<any, keyof React.JSX.IntrinsicElements>> = React.ComponentPropsWithoutRef<T>

const Separator = React.forwardRef<
  ComponentRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
