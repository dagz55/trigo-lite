import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import Image from "next/image"
import PickMeUpIcon from "@/public/pickmeupnow.png"

const pickMeUpNowVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "h-10 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface PickMeUpNowProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pickMeUpNowVariants> {
  asChild?: boolean
}

const PickMeUpNow = React.forwardRef<HTMLButtonElement, PickMeUpNowProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      (<Comp
        className={cn(pickMeUpNowVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
          <Image
            src={PickMeUpIcon}
            alt="Pick Me Up Now"
            width={100}
            height={100}
            className="w-24 h-24" // Adjust size as needed
          />
      </Comp>)
    );
  }
);
PickMeUpNow.displayName = "PickMeUpNow"

export { PickMeUpNow, pickMeUpNowVariants }