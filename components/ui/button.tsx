import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border-b-[3px] border-primary/40 hover:border-primary/60 active:border-b-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-b-[3px] border-destructive/40 hover:border-destructive/60 active:border-b-[1px]",
        outline: "border-2 bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-b-[3px] border-secondary/40 hover:border-secondary/60 active:border-b-[1px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass text-foreground hover:bg-accent/10",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5",
        sm: "h-10 rounded-md gap-1.5 px-5 has-[>svg]:px-4",
        lg: "h-14 rounded-lg px-8 text-lg has-[>svg]:px-6",
        icon: "size-11",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
