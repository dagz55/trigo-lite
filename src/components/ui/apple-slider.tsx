"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface AppleSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  unit?: string
}

const AppleSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  AppleSliderProps
>(({ 
  className, 
  label, 
  value = [50], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  showValue = true,
  unit = "",
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value)
  
  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const currentValue = value || internalValue

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
          {showValue && (
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md min-w-[3rem] text-center">
              {currentValue[0]}{unit}
            </span>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center group",
          className
        )}
        value={currentValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-sm transition-all duration-200" />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-white shadow-lg ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 opacity-20" />
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
      
      {/* Value indicators */}
      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
})

AppleSlider.displayName = "AppleSlider"

export { AppleSlider }
