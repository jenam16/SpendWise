import React from 'react'
import { cn } from '../../utils/cn'

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"

  const variants = {
    primary: "bg-accent-primary hover:bg-indigo-500 text-white shadow-sm hover:shadow-glow-primary",
    secondary: "bg-[#162038] hover:bg-[#1E2B4B] text-text-primary border border-white/10 hover:border-white/20",
    outline: "bg-transparent hover:bg-white/5 text-text-primary border border-white/15 hover:border-white/25",
    ghost: "bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-primary",
    danger: "bg-rose-600/90 hover:bg-rose-600 text-white hover:shadow-lg hover:shadow-rose-950/50",
    subtle: "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-transparent",
  }

  const sizes = {
    xs: "text-xs px-2.5 py-1.5 gap-1.5",
    sm: "text-xs px-3 py-2 gap-2 font-medium",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-5 py-3 gap-2.5",
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={cn("shrink-0", size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-4 h-4')} />
      ) : null}
      
      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className={cn("shrink-0", size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-4 h-4')} />
      ) : null}
    </button>
  )
})

Button.displayName = 'Button'
