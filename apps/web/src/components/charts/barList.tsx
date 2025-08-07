"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BarListData {
  name: string;
  value: number;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BarListProps {
  data: BarListData[];
  className?: string;
  showAnimation?: boolean;
  onValueChange?: (item: BarListData) => void;
  valueFormatter?: (value: number) => string;
  color?: string;
}

export function BarList({
  data,
  className,
  showAnimation = true,
  onValueChange,
  valueFormatter = (value) => value.toString(),
  color = "blue",
}: BarListProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, index) => (
        <div
          key={index}
          className="relative"
          onClick={() => onValueChange?.(item)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">
              {valueFormatter(item.value)}
            </span>
          </div>
          <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                `bg-${color}-500`,
                showAnimation && "transition-all duration-500"
              )}
              style={{
                width: `${(item.value / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}