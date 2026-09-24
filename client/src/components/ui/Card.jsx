import React from 'react'
import { cn } from '../../utils/cn'

export function Card({ children, className, hoverEffect = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-[#10182C] border border-white/[0.07] rounded-xl p-5 shadow-sm transition-all duration-200",
        hoverEffect && "hover:border-white/[0.14] hover:shadow-glow-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, subtitle, ...props }) {
  return (
    <div className={className} {...props}>
      <h3 className="text-base font-semibold text-text-primary tracking-tight">{children}</h3>
      {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}
