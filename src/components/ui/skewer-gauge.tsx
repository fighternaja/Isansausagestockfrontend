import * as React from "react";
import { cn } from "@/lib/utils";

interface SkewerGaugeProps {
  value: number;
  minAlert: number;
  className?: string;
  label?: string;
}

export function SkewerGauge({ value, minAlert, className, label }: SkewerGaugeProps) {
  // Signature Design Element: Skewer Gauge
  // Represents stock level as an Isan sausage skewer instead of a boring progress bar.
  
  const isLow = value <= minAlert;
  
  // Calculate filled dots (max 6)
  let filledDots = 0;
  if (value === 0) filledDots = 0;
  else if (minAlert === 0) {
    // If minAlert is 0, any positive amount is "full" enough
    filledDots = value > 0 ? 6 : 0;
  } else {
    if (value <= minAlert * 0.5) filledDots = 1;
    else if (value <= minAlert) filledDots = 2;
    else if (value <= minAlert * 1.5) filledDots = 3;
    else if (value <= minAlert * 2) filledDots = 4;
    else if (value <= minAlert * 3) filledDots = 5;
    else filledDots = 6;
  }

  const totalDots = 6;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center">
        {/* The stick */}
        <div className="h-1 w-6 bg-border rounded-l-full" />
        
        {/* The sausages (dots) */}
        <div className="flex gap-[2px] px-[2px]">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3.5 w-3.5 rounded-full transition-colors",
                i < filledDots 
                  ? isLow 
                    ? "bg-accent animate-pulseAlert shadow-[0_0_8px_hsla(var(--accent)/0.5)]" 
                    : "bg-success"
                  : "bg-muted border border-border"
              )}
            />
          ))}
        </div>

        {/* The pointy tip */}
        <div className="h-1 w-4 bg-border relative">
          <div className="absolute right-[-4px] top-[-2px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-border" />
        </div>

        {/* Text label */}
        <span className={cn(
          "ml-3 text-xs font-semibold whitespace-nowrap",
          isLow ? "text-accent" : "text-success"
        )}>
          {label || (isLow ? "ต้องเติม!" : "เพียงพอ")}
        </span>
      </div>
    </div>
  );
}
