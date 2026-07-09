import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "glass" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  children?: React.ReactNode
}

const variantClasses = {
  default: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-sm",
  outline: "border border-gray-200 bg-white hover:bg-gray-50 text-foreground",
  ghost: "hover:bg-gray-100 text-foreground",
  glass: "bg-white/70 backdrop-blur border border-gray-200 hover:bg-white/90 text-foreground",
  link: "text-violet-600 underline-offset-4 hover:underline p-0 h-auto",
}

const sizeClasses = {
  default: "h-10 px-5 py-2 text-sm rounded-full",
  sm: "h-9 px-4 text-sm rounded-full",
  lg: "h-12 px-8 text-base rounded-full",
  icon: "h-10 w-10 rounded-full",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      })
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps }

