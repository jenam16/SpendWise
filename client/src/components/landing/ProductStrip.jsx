import React from 'react'
import {
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  Users,
  Scale,
  BarChart3,
  Calendar,
} from 'lucide-react'

const PILLARS = [
  { icon: ArrowLeftRight, label: 'EXPENSE TRACKING' },
  { icon: PieChart, label: 'CATEGORY BUDGETS' },
  { icon: Target, label: 'SAVINGS GOALS' },
  { icon: Repeat, label: 'SUBSCRIPTIONS' },
  { icon: Users, label: 'SHARED EXPENSES' },
  { icon: Scale, label: 'DEBT LEDGER' },
  { icon: BarChart3, label: 'FINANCIAL INSIGHTS' },
  { icon: Calendar, label: 'CALENDAR TIMELINE' },
]

export const ProductStrip = () => {
  return (
    <section className="relative py-8 border-y border-slate-200/80 dark:border-white/[0.06] bg-slate-100/70 dark:bg-[#0A101D]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-5">
          Everything you need to orchestrate personal capital in one place
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {PILLARS.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] hover:border-indigo-400/40 dark:hover:border-white/15 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all duration-150"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="tracking-wide text-[11px]">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProductStrip
