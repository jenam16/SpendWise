import React from 'react'
import { UserPlus, PlusCircle, LineChart, ArrowRight } from 'lucide-react'
import { LANDING_STEPS } from '../../data/landingDemoData'

const STEP_ICONS = [UserPlus, PlusCircle, LineChart]

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden bg-[#F6F7FB] dark:bg-[#0A101D] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Frictionless Onboarding
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            How SpendWise works.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            From empty slate to full financial clarity in three intentional steps.
          </p>
        </div>

        {/* Connected Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {LANDING_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] || UserPlus
            return (
              <div
                key={step.number}
                className="relative p-8 rounded-3xl bg-white dark:bg-[#10182C]/70 border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400/40 hover:shadow-md dark:hover:bg-[#10182C] shadow-xs transition-all duration-300 space-y-5 flex flex-col justify-between group"
              >
                {/* Step Index & Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400/80 transition-colors font-mono">
                    {step.number}
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2.5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Subtle progress indicator */}
                <div className="pt-2">
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full group-hover:w-full transition-all duration-500"
                      style={{ width: `${(index + 1) * 33.33}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
