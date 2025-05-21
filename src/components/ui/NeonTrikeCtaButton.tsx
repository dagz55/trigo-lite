
"use client";

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './button'; // Import Button for potential wrapping or as a base

interface NeonTrikeCtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const NeonTrikeCtaButton = React.forwardRef<HTMLButtonElement, NeonTrikeCtaButtonProps>(
  ({ onClick, disabled, className, isLoading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost" // Use ghost variant to remove default button styling for image button
        size="icon"     // Use icon size for a compact button around the image
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "p-0 rounded-full focus:outline-none transition-transform hover:scale-105 active:scale-95 relative",
          "w-24 h-24 md:w-28 md:h-28", // Responsive size
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label="Request Ride"
        {...props}
      >
        <Image 
          src="/neon-trike-icon.png" 
          alt="Request TriGo Ride" 
          width={96} // Adjust base width, will scale with button size
          height={96} // Adjust base height
          className="opacity-80 filter drop-shadow-[0_0_8px_hsl(var(--primary)_/_0.7)] drop-shadow-[0_0_16px_hsl(var(--chart-2)_/_0.5)]"
          data-ai-hint="tricycle ride request"
          priority // Consider priority if it's a key CTA visible on load
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            {/* You can add a spinner here if needed, for now it's just an overlay */}
          </div>
        )}
      </Button>
    );
  }
);

NeonTrikeCtaButton.displayName = "NeonTrikeCtaButton";

export { NeonTrikeCtaButton };
