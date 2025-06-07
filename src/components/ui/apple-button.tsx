"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const appleButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // Primary - Apple's signature blue button
        primary: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500 shadow-lg hover:shadow-xl",
        
        // Secondary - Gray button
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        
        // Destructive - Red button for dangerous actions
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-lg hover:shadow-xl",
        
        // Outline - Bordered button
        outline: "border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-500",
        
        // Ghost - Transparent button
        ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        
        // Link - Text button
        link: "text-blue-500 underline-offset-4 hover:underline focus-visible:ring-blue-500",
        
        // Glass - Glass morphism button
        glass: "bg-white/70 backdrop-blur-xl border border-white/20 text-gray-900 hover:bg-white/80 shadow-lg hover:shadow-xl",
        
        // Gradient - Purple gradient (TriGo theme)
        gradient: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl focus-visible:ring-purple-500",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg",
        default: "h-11 px-6 py-2",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface AppleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appleButtonVariants> {
  asChild?: boolean
}

const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(appleButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
AppleButton.displayName = "AppleButton"

export { AppleButton, appleButtonVariants }
