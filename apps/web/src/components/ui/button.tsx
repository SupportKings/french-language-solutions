import type * as React from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

const buttonVariants = cva(
  "group relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap align-top font-semibold transition-all duration-200 [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: [
          "text-primary-foreground",
          "shadow-md hover:shadow-lg",
          "bg-primary hover:bg-primary/90",
          "dark:bg-primary dark:hover:bg-primary/90",
        ],
        destructive: [
          "text-white",
          "shadow-md hover:shadow-lg",
          "bg-destructive hover:bg-destructive/90",
          "dark:bg-destructive dark:hover:bg-destructive/90",
        ],
        outline: [
          "text-foreground",
          "border border-input hover:border-muted-foreground/50",
          "shadow-sm hover:shadow-md",
          "bg-background hover:bg-muted",
          "dark:bg-background dark:hover:bg-muted",
        ],
        secondary: [
          "text-secondary-foreground",
          "shadow-md hover:shadow-lg",
          "bg-secondary hover:bg-secondary/80",
          "dark:bg-secondary dark:hover:bg-secondary/80",
        ],
        ghost: [
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "dark:hover:bg-accent dark:hover:text-accent-foreground",
        ],
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
          "dark:text-primary dark:hover:text-primary/80",
        ],
      },
      size: {
        default:
          "h-10 px-4 py-2 text-sm rounded-lg",
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        lg: "h-12 px-6 py-3 text-base rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
