import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export function VoiceInput({ onTranscript, disabled = false, className = '' }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [voiceError, setVoiceError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-IN' // Supports English, Hindi accents, and Hinglish

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceError(null)
      }

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript && transcript.trim()) {
          onTranscript?.(transcript.trim())
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission is required for voice input.')
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try again.')
        } else {
          setVoiceError('Voice input error. You can still type.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e)
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!isSupported) {
      setVoiceError("Voice input isn't supported in this browser. You can still type.")
      return
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch (_) {}
      setIsListening(false)
    } else {
      setVoiceError(null)
      try {
        recognitionRef.current?.start()
      } catch (err) {
        console.warn('Failed to start speech recognition:', err)
        setVoiceError('Could not access microphone.')
      }
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={
          !isSupported
            ? 'Voice input not supported in this browser'
            : isListening
            ? 'Listening... Click to stop'
            : 'Click to speak transaction'
        }
        className={cn(
          "p-2 rounded-lg transition-all duration-200 relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
          isListening
            ? "bg-rose-500 text-white shadow-md animate-pulse ring-2 ring-rose-400"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <Mic className="w-4 h-4 animate-bounce text-white" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating Listening Indicator */}
      {isListening && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500 text-white shadow whitespace-nowrap animate-fadeIn flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Listening...
        </span>
      )}

      {/* Inline Warning Tooltip if Permission Denied or Unsupported */}
      {voiceError && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg border border-white/10 z-50 animate-fadeIn text-center">
          <p>{voiceError}</p>
          <button
            onClick={() => setVoiceError(null)}
            className="text-[10px] text-indigo-400 hover:underline mt-1 block w-full"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
