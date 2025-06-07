"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "outlined"
  padding?: "none" | "sm" | "md" | "lg"
}

const AppleCard = React.forwardRef<HTMLDivElement, AppleCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300 ease-out",
          {
            // Default variant - clean white card with subtle shadow
            "bg-white border border-gray-100 shadow-sm hover:shadow-md": variant === "default",
            
            // Elevated variant - more prominent shadow
            "bg-white border border-gray-100 shadow-lg hover:shadow-xl": variant === "elevated",
            
            // Glass variant - glass morphism effect
            "bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg": variant === "glass",
            
            // Outlined variant - just border, no shadow
            "bg-white border-2 border-gray-200 hover:border-gray-300": variant === "outlined",
          },
          {
            "p-0": padding === "none",
            "p-3": padding === "sm", 
            "p-6": padding === "md",
            "p-8": padding === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AppleCard.displayName = "AppleCard"

interface AppleCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppleCardHeader = React.forwardRef<HTMLDivElement, AppleCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  )
)
AppleCardHeader.displayName = "AppleCardHeader"

interface AppleCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AppleCardTitle = React.forwardRef<HTMLParagraphElement, AppleCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-gray-900",
        className
      )}
      {...props}
    />
  )
)
AppleCardTitle.displayName = "AppleCardTitle"

interface AppleCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AppleCardDescription = React.forwardRef<HTMLParagraphElement, AppleCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 leading-relaxed", className)}
      {...props}
    />
  )
)
AppleCardDescription.displayName = "AppleCardDescription"

interface AppleCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppleCardContent = React.forwardRef<HTMLDivElement, AppleCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
AppleCardContent.displayName = "AppleCardContent"

interface AppleCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppleCardFooter = React.forwardRef<HTMLDivElement, AppleCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
)
AppleCardFooter.displayName = "AppleCardFooter"

export {
  AppleCard,
  AppleCardHeader,
  AppleCardFooter,
  AppleCardTitle,
  AppleCardDescription,
  AppleCardContent,
}
