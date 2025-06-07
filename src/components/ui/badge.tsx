import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#6322FE] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#6322FE] text-[#ffffff] hover:bg-[#5719d8]",
        secondary:
          "border-transparent bg-[#f3f4f6] text-[#1f2937] hover:bg-[#e5e7eb]",
        destructive:
          "border-transparent bg-[#ef4444] text-[#ffffff] hover:bg-[#dc2626]",
        outline: "text-[#1f2937] border-[#e5e7eb]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };