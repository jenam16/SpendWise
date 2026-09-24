import React from 'react'
import {
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  Users,
  Scale,
  BarChart3,
  FileText,
  Bell,
} from 'lucide-react'

const PILLARS = [
  {
    icon: ArrowLeftRight,
    title: 'Precision Transaction Tracking',
    description:
      'Log expenses and deposits in seconds with tags, notes, payment channels (UPI, Card, Cash), and optional receipt attachments.',
    badge: 'Core Engine',
  },
  {
    icon: PieChart,
    title: 'Category Budget Guardrails',
    description:
      'Establish proactive monthly thresholds. SpendWise tracks live consumption and sounds the alarm at 80% and 100% capacity.',
    badge: 'Control',
  },
  {
    icon: Target,
    title: 'Target Savings Milestones',
    description:
      'Set capital targets with target dates. Record micro-deposits, track live progress percentages, and celebrate completions.',
    badge: 'Growth',
  },
  {
    icon: Repeat,
    title: 'Subscription & Bill Lifecycle',
    description:
      'Unify recurring bills, digital subscriptions, and memberships. Normalize monthly equivalents and forecast annual burn accurately.',
    badge: 'Automation',
  },
  {
    icon: Users,
    title: 'Shared Group Expenses',
    description:
      'Split trips, team dinners, or shared apartment bills. Supports equal or custom shares with single-click settlement reconciliation.',
    badge: 'Collaborative',
  },
  {
    icon: Scale,
    title: 'Peer Debt & Loan Ledger',
    description:
      'Track money you owe friends and money owed back to you. Maintain audit trails of partial repayments without awkward talks.',
    badge: 'Transparency',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics & Velocity',
    description:
      'View spending distribution curves, payment channel percentages, top expense drivers, and day-by-day average burn.',
    badge: 'Intelligence',
  },
  {
    icon: FileText,
    title: 'Executive PDF Statements',
    description:
      'Generate professional PDF financial statements formatted for accountants, tax review, or personal quarterly records.',
    badge: 'Reporting',
  },
]

export const WhatIsSpendWise = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#F6F7FB] dark:bg-[#0A101D] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Unified Architecture
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            One workspace for your financial life.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            SpendWise unites every dimension of personal capital management into a single, cohesive
            interface designed for clarity and speed.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-white dark:bg-[#10182C]/70 border border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-400/40 hover:shadow-md dark:hover:bg-[#10182C] shadow-xs transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.05]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhatIsSpendWise
