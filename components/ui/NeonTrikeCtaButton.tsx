import * as React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NeonTrikeIcon from './NeonTrikeIcon'; // Import the new icon component

interface NeonTrikeCtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Any additional props specific to NeonTrikeCtaButton can go here
}

const NeonTrikeCtaButton = React.forwardRef<HTMLButtonElement, NeonTrikeCtaButtonProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative w-20 h-20 rounded-full overflow-hidden p-0", // Adjust size as needed
          "bg-transparent border-none shadow-lg",
          "flex items-center justify-center",
          "transition-transform transition-shadow duration-200 ease-in-out",
          "hover:scale-110 hover:shadow-[0_0_25px_hsl(var(--neon-green)_/_0.6),_0_0_40px_hsl(var(--neon-green)_/_0.4)]", // Adjust glow color/intensity
          "active:scale-95",
          disabled ? "opacity-50 cursor-not-allowed" : "opacity-85", // Apply opacity here
          className
        )}
        disabled={disabled}
        {...props}
      >
        {/* Use the imported NeonTrikeIcon component */}
        <NeonTrikeIcon style={{ width: '100%', height: '100%' }} /> 
      </Button>
    );
  }
);
NeonTrikeCtaButton.displayName = "NeonTrikeCtaButton";

export { NeonTrikeCtaButton };