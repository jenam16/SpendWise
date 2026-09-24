import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className,
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full bg-[#0C1322] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-primary appearance-none cursor-pointer pr-10 transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
            error && "border-rose-500/50 focus:border-rose-500",
            className
          )}
          {...props}
        >
          {children ? children : options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#10182C] text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  )
})

Select.displayName = 'Select'
