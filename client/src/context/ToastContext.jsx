import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5)
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success'
          const isError = t.type === 'error'

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-fadeIn ${
                isSuccess
                  ? 'bg-[#0C1A1A]/95 border-emerald-500/30 text-emerald-300'
                  : isError
                  ? 'bg-[#1F1018]/95 border-rose-500/30 text-rose-300'
                  : 'bg-[#10182C]/95 border-white/15 text-white'
              }`}
              role="alert"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Info className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-white/50 hover:text-white rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
