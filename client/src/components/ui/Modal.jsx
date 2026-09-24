import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className,
  bodyClassName,
  noPadding = false,
  headerActions,
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          "relative w-full bg-white dark:bg-[#10182C] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[calc(100vh-48px)] transform transition-all animate-scaleUp",
          maxWidth,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/[0.08] shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-text-primary tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-text-secondary mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerActions}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className={cn("overflow-y-auto flex-1", noPadding ? "" : "p-5 sm:p-6", bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
