
"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Bike } from 'lucide-react'; // Using a Lucide icon

interface NeonTrikeCtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const NeonTrikeCtaButton = React.forwardRef<HTMLButtonElement, NeonTrikeCtaButtonProps>(
  ({ onClick, disabled, className, isLoading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost" // Use ghost to have minimal button styling
        size="icon"     // Ensure it's icon-sized
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "relative rounded-full focus:outline-none transition-transform hover:scale-110 active:scale-95",
          "w-24 h-24 md:w-28 md:h-28", // Responsive size
          "bg-primary/20 hover:bg-primary/30 border-2 border-primary", // Neon green-ish background and border
          "shadow-[0_0_15px_hsl(var(--primary)),_0_0_25px_hsl(var(--primary)_/_0.7)]", // Neon glow
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label="Request Ride"
        {...props}
      >
        <Bike className="w-12 h-12 md:w-14 md:h-14 text-primary-foreground" strokeWidth={1.5} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            {/* Spinner can be added here if needed */}
          </div>
        )}
      </Button>
    );
  }
);

NeonTrikeCtaButton.displayName = "NeonTrikeCtaButton";

export { NeonTrikeCtaButton };
