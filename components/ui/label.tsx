"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Modern React 19+ type definitions with proper constraints
type ComponentRef<T extends React.ElementType<any, keyof React.JSX.IntrinsicElements>> = React.ComponentRef<T>
type ComponentPropsWithoutRef<T extends React.ElementType<any, keyof React.JSX.IntrinsicElements>> = React.ComponentPropsWithoutRef<T>

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  ComponentRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
