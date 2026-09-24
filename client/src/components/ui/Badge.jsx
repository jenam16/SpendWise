import React from 'react'
import { cn } from '../../utils/cn'

export function Badge({ children, variant = 'default', size = 'sm', className, ...props }) {
  const variants = {
    default: "bg-white/10 text-text-primary border-transparent",
    income: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    expense: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    purple: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    neutral: "bg-white/5 text-text-secondary border-white/10",
  }

  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5 rounded font-medium",
    sm: "text-xs px-2.5 py-0.5 rounded-full font-medium",
    md: "text-xs px-3 py-1 rounded-full font-semibold",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
