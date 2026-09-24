import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Clock,
} from 'lucide-react'

export const IntroSection = () => {
  return (
    <section id="product" className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-[#070B14] border-t border-slate-200/80 dark:border-transparent transition-colors">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: The Problem & The Solution */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>The Problem of Fragmented Apps</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Your finances shouldn't feel scattered.
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Between bank statement PDFs, credit card apps, notes apps, and neglected spreadsheets,
              most people only realize where their money went after it is already spent.
            </p>

            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              SpendWise replaces chaos with a synchronized command center. Track daily transactions,
              guard against runaway expenses with real-time budget limits, audit active subscriptions,
              and watch your savings milestones advance in real time.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10182C]/70 border border-slate-200/80 dark:border-white/[0.06]">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  No Bank Sync Headaches
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You maintain 100% control over entries without broken third-party bank connectors.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10182C]/70 border border-slate-200/80 dark:border-white/[0.06]">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Private & Isolated
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your financial records are strictly isolated. No ad networks, no data selling.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Composed Financial Pulse Visual */}
          <div className="lg:col-span-6">
            <div className="relative bg-slate-50 dark:bg-[#0C1322] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-black/60 space-y-6">
              {/* Header of Visual */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Unified Cash Flow Engine
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Continuous Financial Velocity</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Synchronized
                </div>
              </div>

              {/* Composed Flow Architecture */}
              <div className="space-y-4">
                {/* 1. Inflow Node */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#10182C] border border-emerald-500/20 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Monthly Inflow</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Salary & Retainer Invoices</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">+₹85,000</span>
                </div>

                {/* Flow Connector Arrow */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-[#070B14] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 text-xs shadow-xs">
                    ↓
                  </div>
                </div>

                {/* 2. Outflow Guardrails Node */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#10182C] border border-rose-500/20 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Controlled Expenses</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Fixed Living & Variable Discretionary</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400">−₹36,750</span>
                </div>

                {/* Flow Connector Arrow */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-[#070B14] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 text-xs shadow-xs">
                    ↓
                  </div>
                </div>

                {/* 3. Retained Capital / Savings Allocation */}
                <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-[#10182C] dark:to-[#10182C] border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">Net Capital Retention</span>
                    </div>
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-300">₹48,250 (56.8%)</span>
                  </div>

                  {/* Progress visualization */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        style={{ width: '56.8%' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>Expenses: 43.2%</span>
                      <span>Target: Emergency Fund & Growth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default IntroSection
