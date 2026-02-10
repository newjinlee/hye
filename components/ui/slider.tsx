// components/ui/slider.tsx
"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  orientation?: "horizontal" | "vertical"
}

function Slider({ className, orientation = "horizontal", ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      orientation={orientation}
      className={cn(
        "relative flex touch-none select-none",
        orientation === "horizontal" 
          ? "w-full items-center" 
          : "h-full flex-col justify-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track 
        className={cn(
          "relative grow overflow-hidden rounded-full bg-white/30",
          orientation === "horizontal" 
            ? "h-1.5 w-full" 
            : "w-1.5 h-full"
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            "absolute bg-white",
            orientation === "horizontal" 
              ? "h-full" 
              : "w-full"
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border border-white/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
}

export { Slider }