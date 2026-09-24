import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function SearchBar({
  value,
  onChange,
  placeholder = "Search transactions, categories...",
  className,
  onClear,
}) {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-3.5 text-text-muted pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0C1322] border border-white/10 rounded-lg pl-10 pr-9 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
      />
      {value && (
        <button
          onClick={onClear || (() => onChange(''))}
          className="absolute right-3 p-1 rounded hover:bg-white/10 text-text-muted hover:text-white"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
