import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, X, Send, Loader2, RefreshCw, MessageSquare } from 'lucide-react'
import { VoiceInput } from './VoiceInput'
import { AITransactionPreview } from './AITransactionPreview'
import { AIFinancialAnswer } from './AIFinancialAnswer'
import { aiService } from '../../services/aiService'
import { cn } from '../../utils/cn'

const SUGGESTIONS = [
  'Spent 200 on food via UPI',
  'How much did I spend on food this month?',
  'Salary 45000 received in bank',
  'How much did I save this month?',
]

export function SpendWiseAI({ onTransactionCreated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const inputRef = useRef(null)

  // Listen for external trigger events (e.g. from Dashboard Quick Actions)
  useEffect(() => {
    const handleOpenAI = (e) => {
      setIsOpen(true)
      if (e?.detail?.prompt) {
        setInput(e.detail.prompt)
      }
    }
    window.addEventListener('spendwise:open-ai', handleOpenAI)
    return () => window.removeEventListener('spendwise:open-ai', handleOpenAI)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleParse = async (textToParse = null) => {
    const text = (textToParse || input).trim()
    if (!text || loading) return

    setLoading(true)
    setError(null)
    setParsedData(null)
    setQueryResult(null)
    setStatusMessage('Analyzing with SpendWise AI...')

    try {
      console.log('[SpendWise AI] Input:', text)
      const res = await aiService.queryAI(text)
      console.log('[SpendWise AI] Response:', res)

      // Check for financial query intent
      if (res?.intent === 'financial_query') {
        setQueryResult(res)
        setStatusMessage('')
      } else if (res?.data?.intent === 'financial_query') {
        setQueryResult(res.data)
        setStatusMessage('')
      } else {
        // Transaction intent
        const parsed = res?.data || res
        if (parsed && (parsed.type || parsed.category || parsed.intent || parsed.amount !== undefined)) {
          setParsedData(parsed.data || parsed)
          setStatusMessage('')
        } else {
          console.warn('[SpendWise AI] Unrecognized response payload:', res)
          setError("Couldn't understand that request right now.")
        }
      }
    } catch (err) {
      console.warn('[SpendWise AI] AI Error:', err)
      setError(err?.message || "Couldn't process your request right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript)
    // Automatically initiate parsing on voice transcript received
    handleParse(transcript)
  }

  const handleSuccess = (created) => {
    setParsedData(null)
    setInput('')
    setError(null)
    setStatusMessage('')
    setIsOpen(false)
    onTransactionCreated?.(created)
    // Also dispatch global event for dashboard refresh
    window.dispatchEvent(new CustomEvent('spendwise:transaction-added', { detail: created }))
  }

  const handleCancel = () => {
    setParsedData(null)
    setStatusMessage('')
    setError(null)
  }

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Open SpendWise AI natural language assistant"
          aria-label="Open SpendWise AI assistant"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
          <span className="tracking-wide"> AI</span>
        </button>
      )}

      {/* Floating Compact Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] max-h-[520px] flex flex-col bg-white dark:bg-[#10182C] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  SpendWise AI
                  <span className="text-[10px] font-normal text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-1.5 py-0.2 rounded">
                    Smart Input
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  Track finances or ask questions naturally.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Loading Status */}
            {loading && (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300 animate-fadeIn">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{statusMessage || 'Analyzing with SpendWise AI...'}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-2 animate-fadeIn">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => handleParse()}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            )}

            {/* Financial Query Result Card */}
            {queryResult && (
              <AIFinancialAnswer
                queryResult={queryResult}
                onDismiss={() => {
                  setQueryResult(null)
                  setInput('')
                }}
              />
            )}

            {/* Parsed Transaction Preview Card */}
            {parsedData && (
              <AITransactionPreview
                parsedData={parsedData}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}

            {/* Introductory Suggestions (when idle and no preview / query result) */}
            {!parsedData && !queryResult && !loading && (
              <div className="space-y-2 py-1">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Quick Examples
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setInput(item)
                        handleParse(item)
                      }}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#0C1322] dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/5 transition-all truncate flex items-center justify-between group"
                    >
                      <span className="truncate">"{item}"</span>
                      <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Bar (Footer) */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleParse()
            }}
            className="p-3 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] shrink-0"
          >
            <div className="relative flex items-center bg-white dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-xl shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <input
                ref={inputRef}
                type="text"
                placeholder="Add transaction or ask a financial question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 h-10 px-3 text-xs bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />

              <div className="flex items-center gap-1 pr-1.5">
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Send to SpendWise AI"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5">
              Ask questions or add transactions in English, Hindi, or Hinglish.
            </p>
          </form>
        </div>
      )}
    </>
  )
}
