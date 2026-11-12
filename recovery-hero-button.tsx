import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300",
  {
    variants: {
      variant: {
        primary: "bg-orange-400 text-[#17100b] hover:bg-orange-300",
        outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({ asChild, className, variant, ...props }:
  ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return <Component className={twMerge(buttonVariants({ variant }), className)} {...props} />;
}
