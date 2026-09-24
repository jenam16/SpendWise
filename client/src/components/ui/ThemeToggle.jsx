import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../utils/cn'

export function ThemeToggle({ className, size = 'default' }) {
  const { isDark, toggleTheme } = useTheme()

  const isSmall = size === 'sm'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
        isDark
          ? 'bg-[#10182C] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05] shadow-sm'
          : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm',
        isSmall ? 'p-1.5' : 'p-2',
        className
      )}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
    >
      {isDark ? (
        <Sun
          className={cn(
            'text-amber-400 hover:rotate-45 transition-transform duration-300',
            isSmall ? 'w-4 h-4' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'
          )}
        />
      ) : (
        <Moon
          className={cn(
            'text-indigo-600 hover:-rotate-12 transition-transform duration-300',
            isSmall ? 'w-4 h-4' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'
          )}
        />
      )}
    </button>
  )
}

export default ThemeToggle
