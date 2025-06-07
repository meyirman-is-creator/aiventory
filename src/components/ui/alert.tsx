import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[#1f2937]",
    {
        variants: {
            variant: {
                default: "bg-[#ffffff] text-[#1f2937] border-[#e5e7eb]",
                destructive:
                    "border-[#ef4444]/50 text-[#ef4444] dark:border-[#ef4444] [&>svg]:text-[#ef4444]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Alert = React.forwardRef< 
HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps < typeof alertVariants >
> (({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    ));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
HTMLParagraphElement,
    React.HTMLAttributes < HTMLHeadingElement >
> (({ className, ...props }, ref) => (
        <h5
            ref={ref}
            className={cn("mb-1 font-medium leading-none tracking-tight", className)}
            {...props}
        />
    ));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
HTMLParagraphElement,
    React.HTMLAttributes < HTMLParagraphElement >
> (({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("text-sm [&_p]:leading-relaxed", className)}
            {...props}
        />
    ));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };