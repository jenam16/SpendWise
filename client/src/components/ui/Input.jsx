import React from 'react'
import { cn } from '../../utils/cn'

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full bg-[#0C1322] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
            Icon && "pl-9",
            error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  )
})

Input.displayName = 'Input'
